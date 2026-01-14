import { InjectionKey } from "vue";

/**
 * Injection key: "getFocusWhenListEmpty", used to specify which HTMLElement
 * to focus when a FileList becomes empty (after a FileListFile deletion)
 */
export const getFocusWhenListEmptyKey =
  Symbol("getFocusWhenListEmpty") as InjectionKey<(() => HTMLElement | null | null)>;
