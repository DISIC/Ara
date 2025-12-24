import ky, { HTTPError, TimeoutError } from "ky";
import { getFileMessage } from "../enums";
import { useAuditStore, useResultsStore } from "../store";
import { ExampleImageFile, NotesFile } from "../types";
import { captureWithPayloads, getUploadUrl, isImage } from "../utils";
import { useNotifications } from "./useNotifications";

export function useFileHandler() {
  const resultsStore = useResultsStore();
  const auditStore = useAuditStore();
  const notify = useNotifications();

  /**
   * Uploads a file linked to a criterium (currently only images)
   *
   * 1) Creates a thumbnail from the given image (file)
   * 2) Uploads the image + its thumbnail in an S3 bucket
   * 3) Creates an new StoredFile entity and store it in the database
   *
   * See back-end: AuditService#saveExampleImage
   *
   * TODO: we don’t use this function anymore
   */
  async function uploadCriteriumFile(auditUniqueId: string, pageId: number, topicNumber: number, criteriumNumber: number, file: File) {
    try {
      await resultsStore.uploadExampleImage(
        auditUniqueId,
        pageId,
        topicNumber,
        criteriumNumber,
        file
      );
    } catch (error) {
      resultsStore.lastRequestFailed = true;
      throw await handleFileUploadError(error, file);
    }
  }

  /**
   * Deletes an image linked to a criterium
   *
   * 1) Gets the associated thumbnail and image URLs from the given ExampleImageFile (image)
   * 2) Removes the image + the thumbnail from the S3 bucket
   * 3) Removes the StoredFile entity from the database
   *
   * See back-end: AuditService#deleteAuditFile
   */
  async function deleteCriteriumAuditFile(auditUniqueId: string, pageId: number, topicNumber: number, criteriumNumber: number, auditFile: ExampleImageFile) {
    try {
      await resultsStore.deleteExampleImage(
        auditUniqueId,
        pageId,
        topicNumber,
        criteriumNumber,
        auditFile.id
      );
    } catch (error) {
      resultsStore.lastRequestFailed = true;
      throw handleFileDeleteError(error, auditFile);
    }
  }

  async function uploadGlobalFile(auditUniqueId: string, file: File) {
    try {
      return await auditStore.uploadAuditFile(auditUniqueId, file);
    } catch (error) {
      auditStore.lastRequestFailed = true;
      throw await handleFileUploadError(error, file);
    }
  }

  async function deleteGlobalAuditFile(auditUniqueId: string, auditFile: NotesFile) {
    try {
      await auditStore.deleteAuditFile(auditUniqueId, auditFile.id);
    } catch (error) {
      auditStore.lastRequestFailed = true;
      throw handleFileDeleteError(error, auditFile);
    }
  }

  /**
   * Function to upload an image file inside the editor
   * @returns a promise that resolves with the URL of the uploaded image
   */
  async function uploadEditorImage(file: File): Promise<string> {
    const formData = new FormData();
    // To handle non-ascii characters, we encode the filename here
    // and decode it on the backend side
    formData.set("file", file, encodeURI(file.name));

    try {
      const imageUploadKey = (await ky
        .post(`/api/audits/editor/images`, { body: formData, timeout: 15_000 })
        .text()) as string;

      const url = getUploadUrl(imageUploadKey);
      return url;
    } catch (error) {
      throw await handleFileUploadError(error, file);
    }
  }

  // Note: this function is async because of async `json()` call
  async function handleFileUploadError(
    error: unknown,
    file: File
  ): Promise<string | null> {
    const fileName = file.name;
    let errorMessage: string | null = null;

    if (!(error instanceof Error)) {
      console.error("An unexpected error occurred", error);
      return null;
    }

    if (error instanceof TimeoutError) {
      errorMessage = getFileMessage("UPLOAD_ERROR_TIMEOUT", fileName);
    } else if (error instanceof HTTPError) {
      // 413 Entity Too Large
      if (error.response.status === 413) {
        if (isImage(file)) {
          errorMessage = getFileMessage("UPLOAD_ERROR_SIZE_IMAGE", fileName);
        } else {
          errorMessage = getFileMessage("UPLOAD_ERROR_SIZE", fileName);
        }
      }
      // 422 Unprocessable Entity
      else if (error.response.status === 422) {
        const body = await error.response.json();

        if (body.message.includes("expected type")) {
          errorMessage = getFileMessage("UPLOAD_ERROR_FORMAT_IMAGE", fileName);
        } else if (body.message.includes("expected size")) {
          errorMessage = getFileMessage("UPLOAD_ERROR_SIZE", fileName);
        } else {
          errorMessage = getFileMessage("UPLOAD_ERROR_UNKNOWN", fileName);
        }
      }
      // Other errors
      else {
        errorMessage = getFileMessage("UPLOAD_ERROR_UNKNOWN", fileName);
      }
    } else {
      errorMessage = getFileMessage("UPLOAD_ERROR_UNKNOWN", fileName);
    }

    captureWithPayloads(error);
    notify("error", undefined, errorMessage);
    return errorMessage;
  }

  function handleFileDeleteError(
    error: unknown,
    file: ExampleImageFile | NotesFile
  ): string | null {
    const fileName = file.originalFilename;
    let errorMessage: string | null = null;

    if (!(error instanceof Error)) {
      console.error("An unexpected error occurred", error);
    }
    if (error instanceof TimeoutError) {
      errorMessage = getFileMessage("DELETE_ERROR_TIMEOUT", fileName);
    } else {
      errorMessage = getFileMessage("DELETE_ERROR_UNKNOWN", fileName);
      captureWithPayloads(error);
    }

    captureWithPayloads(error);
    notify("error", undefined, errorMessage);
    return errorMessage;
  }

  return {
    uploadCriteriumFile,
    uploadEditorImage,
    deleteCriteriumAuditFile,
    uploadGlobalFile,
    deleteGlobalAuditFile
  };
}
