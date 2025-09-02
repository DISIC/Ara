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

export enum FileMessage {
  DELETE_ERROR_UNKNOWN = "Une erreur inconnue empêche la suppression du fichier <strong>[FILE]</strong>. Veuillez réessayer.",
  DELETE_SUCCESS = "<strong>[FILE]</strong> a été correctement supprimé.",
  UPLOAD_ERROR_FORMAT = "Format de fichier non supporté (<strong>[FILE]</strong>)</span>.",
  UPLOAD_ERROR_SIZE = "<strong>[FILE]</strong> dépasse la limite de 2 Mo. Veuillez choisir un fichier plus léger.",
  UPLOAD_ERROR_TIMEOUT = "Le téléchargement du fichier <strong>[FILE]</strong> a pris trop de temps et a été interrompu. Veuillez vérifier votre connexion Internet et réessayer.",
  UPLOAD_ERROR_UNKNOWN = "Une erreur inconnue empêche le téléchargement du fichier <strong>[FILE]</strong>. Veuillez réessayer.",
  UPLOAD_SUCCESS = "<strong>[FILE]</strong> a été correctement ajouté."
}

export function getFileMessage(fileMessage: keyof typeof FileMessage, fileName: string): string {
  return FileMessage[fileMessage].replace("[FILE]", fileName);
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
