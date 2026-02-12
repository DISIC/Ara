import { slugify } from "./utils";

export enum Platform {
  DESKTOP = "Ordinateur",
  MOBILE = "Mobile"
}

export enum OperatingSystem {
  MAC_OS = "MacOS",
  WINDOWS = "Windows",
  I_OS = "iOS",
  ANDROID = "Android"
}

export enum AssistiveTechnology {
  JAWS = "JAWS",
  NVDA = "NVDA",
  VOICE_OVER = "VoiceOver",
  TALKBACK = "Talkback"
}

export enum Browsers {
  FIREFOX = "Firefox",
  CHROME = "Google Chrome",
  SAFARI = "Safari",
  EDGE = "Microsoft Edge"
}

export const MAX_UPLOAD_FILES_COUNT = 1;
export const FILE_SIZE_LIMIT = 2_000_000;

enum FileMessage {
  DELETE_ERROR_TIMEOUT = "Échec de la suppression. Vérifiez votre connexion et réessayez.",
  DELETE_SUCCESS = "Fichier [FILE] supprimé.",
  DELETE_SUCCESS_IMAGE = "Image [FILE] supprimée.",
  FETCH_ERROR_IMAGE = "Echec de l'importation. Importez l'image depuis votre ordinateur.",
  UPLOAD_ERROR_FORMAT_IMAGE = "Format non pris en charge. Importez une image.",
  UPLOAD_ERROR_FROM_HTML_MULTIPLE = "Echec de l'importation. Importez les images depuis votre ordinateur.",
  UPLOAD_ERROR_MULTIPLE_FILES = "Echec de l'importation. Ajoutez une seule image à la fois.",
  UPLOAD_ERROR_SIZE = "Fichier trop lourd. Choisissez un fichier inférieur à 2 Mo.",
  UPLOAD_ERROR_SIZE_IMAGE = "Image trop lourde. Choisissez une image inférieure à 2 Mo.",
  UPLOAD_ERROR_TIMEOUT = "Échec de l'importation. Vérifiez votre connexion et réessayez.",
  UPLOAD_SUCCESS = "Fichier [FILE] ajouté.",
  UPLOAD_SUCCESS_IMAGE = "Image [FILE] ajoutée.",
  UNKNOWN_ERROR = "Réessayez. Si le problème persiste, contactez-nous : ara@design.numérique.fr"
}

export function getFileMessage(fileMessage: keyof typeof FileMessage, options?: {
  fileName: string;
}): string {
  if (options?.fileName) {
    return FileMessage[fileMessage].replace("[FILE]", options.fileName);
  } else {
    return FileMessage[fileMessage];
  }
}

export enum StaticTabLabel {
  AUDIT_COMMON_ELEMENTS_TAB_LABEL = "Éléments transverses",
  REPORT_RESULTS_TAB_LABEL = "Résultats",
  REPORT_NOTES_TAB_LABEL = "Observations",
  REPORT_ERRORS_TAB_LABEL = "Détails des non-conformités",
  REPORT_IMPROVEMENTS_TAB_LABEL = "Points d’amélioration"
}

export const TabSlug = {
  AUDIT_COMMON_ELEMENTS_SLUG: slugify(
    StaticTabLabel.AUDIT_COMMON_ELEMENTS_TAB_LABEL
  ),
  REPORT_RESULTS_SLUG: slugify(StaticTabLabel.REPORT_RESULTS_TAB_LABEL),
  REPORT_NOTES_SLUG: slugify(StaticTabLabel.REPORT_NOTES_TAB_LABEL),
  REPORT_ERRORS_SLUG: slugify(StaticTabLabel.REPORT_ERRORS_TAB_LABEL),
  REPORT_IMPROVEMENTS_SLUG: slugify(
    StaticTabLabel.REPORT_IMPROVEMENTS_TAB_LABEL
  )
};

export const FirstTab = {
  AUDIT_SLUG: slugify(StaticTabLabel.AUDIT_COMMON_ELEMENTS_TAB_LABEL),
  REPORT_SLUG: slugify(StaticTabLabel.REPORT_RESULTS_TAB_LABEL)
};

export const REFERENTIAL = "RGAA version 4.1.2";
