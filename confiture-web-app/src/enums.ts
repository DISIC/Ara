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

export enum FileErrorMessage {
  UPLOAD_SIZE = "Image trop lourde. Choisissez une image inférieure à 2 Mo.",
  UPLOAD_FORMAT = "Format non pris en charge. Importez une image.",
  UPLOAD_TIMEOUT = "Importation interrompue, délai d’attente dépassé. Vérifiez votre connexion et réessayez.",
  UPLOAD_MAX_FILES_COUNT = "Importation échouée. Ajoutez une seule image à la fois.",
  FETCH_ERROR = "Importation échouée. Importez l’image depuis votre ordinateur.",
  UNKNOWN_ERROR = "Erreur inconnue. Réessayez."
};

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
