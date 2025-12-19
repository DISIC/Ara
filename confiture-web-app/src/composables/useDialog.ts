/**
 * Only one modal at a time in the app!
 */
import { UseConfirmDialogRevealResult } from "@vueuse/core";
import { useDialogStore } from "../store";

export function useDialog() {
  const store = useDialogStore();
  async function showConfirm(options: {
    title: string;
    message: string;
    cancelLabel?: string;
    confirmLabel?: string;
    getFocusOnConceal?: (() => HTMLElement | null) | null;
    data?: any;
  }): Promise<UseConfirmDialogRevealResult<any, boolean>> {
    return await store.showDialog(
      options.title,
      options.message,
      options.confirmLabel || "Valider",
      options.cancelLabel || "Annuler",
      options.getFocusOnConceal || null,
      options.data
    );
  }

  return { showConfirm };
}
