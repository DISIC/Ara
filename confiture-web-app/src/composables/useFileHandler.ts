import { HTTPError, TimeoutError } from "ky";
import { getFileMessage } from "../enums";
import { useAuditStore, useResultsStore } from "../store";
import { ExampleImageFile, NotesFile } from "../types";
import { captureWithPayloads } from "../utils";
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
   * Note: we don’t use this function anymore
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
      if (error instanceof Error) {
        throw await handleFileUploadError(error, file.name);
      } else {
        console.error("An unexpected error occurred", error);
      }
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
      if (error instanceof Error) {
        throw handleFileDeleteError(error, auditFile.originalFilename);
      } else {
        console.error("An unexpected error occurred", error);
      }
    }
  }

  async function uploadGlobalFile(auditUniqueId: string, file: File) {
    try {
      const uploadRes = await auditStore.uploadAuditFile(auditUniqueId, file);
      return uploadRes;
    } catch (error: unknown) {
      auditStore.lastRequestFailed = true;
      if (error instanceof Error) {
        throw await handleFileUploadError(error, file.name);
      } else {
        console.error("An unexpected error occurred", error);
      }
    }
  }

  async function deleteGlobalAuditFile(auditUniqueId: string, auditFile: NotesFile) {
    try {
      await auditStore.deleteAuditFile(auditUniqueId, auditFile.id);
    } catch (error) {
      auditStore.lastRequestFailed = true;
      if (error instanceof Error) {
        throw handleFileDeleteError(error, auditFile.originalFilename);
      } else {
        console.error("An unexpected error occurred", error);
      }
    }
  }

  async function handleFileUploadError(
    error: Error,
    fileName: string
  ): Promise<string | null> {
    let errorMessage: string | null = null;

    if (error instanceof TimeoutError) {
      errorMessage = getFileMessage("UPLOAD_ERROR_TIMEOUT", fileName);
    } else if (error instanceof HTTPError) {
      // 413 Entity Too Large
      if (error.response.status === 413) {
        errorMessage = getFileMessage("UPLOAD_ERROR_SIZE", fileName);
      }
      // 422 Unprocessable Entity
      else if (error.response.status === 422) {
        const body = await error.response.json();

        if (body.message.includes("expected type")) {
          errorMessage = getFileMessage("UPLOAD_IMAGE_ERROR_FORMAT", fileName);
        } else if (body.message.includes("expected size")) {
          errorMessage = getFileMessage("UPLOAD_ERROR_SIZE", fileName);
        } else {
          errorMessage = getFileMessage("UNKNOWN_ERROR", fileName);
          captureWithPayloads(error);
        }
      }
      // Other errors
      else {
        errorMessage = getFileMessage("UNKNOWN_ERROR", fileName);
        captureWithPayloads(error);
      }
    } else {
      console.error("An unexpected error occurred", error);
      errorMessage = getFileMessage("UNKNOWN_ERROR", fileName);
      captureWithPayloads(error);
    }
    notify("error", errorMessage);
    return errorMessage;
  }

  function handleFileDeleteError(
    error: Error,
    fileName: string
  ): string | null {
    let errorMessage: string | null = null;

    if (error instanceof TimeoutError) {
      errorMessage = getFileMessage("DELETE_ERROR_TIMEOUT", fileName);
    } else {
      console.error("An unexpected error occurred", error);
      errorMessage = getFileMessage("UNKNOWN_ERROR", fileName);
      captureWithPayloads(error);
    }

    notify("error", "Erreur", errorMessage);
    return errorMessage;
  }

  return {
    uploadCriteriumFile,
    deleteCriteriumAuditFile,
    uploadGlobalFile,
    deleteGlobalAuditFile
  };
}
