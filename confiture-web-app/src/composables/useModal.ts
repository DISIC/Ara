/**
 * Only one modal at a time in the app!
 */
import { confirmDialog, useGenericModal } from "./useGenericModal";

const { reveal } = confirmDialog;

const {
  title,
  message,
  confirmLabel,
  cancelLabel,
  getFocusOnConceal
} = useGenericModal();

export function useModal() {
  async function showConfirm(options: {
    title: string;
    message: string;
    cancelLabel?: string;
    confirmLabel?: string;
    getFocusOnConceal?: (() => HTMLElement | null) | null;
  }): Promise<{ data?: any; isCanceled: boolean }> {
    title.value = options.title;
    message.value = options.message;
    confirmLabel.value = options.confirmLabel || "Confirmer";
    cancelLabel.value = options.cancelLabel || "Annuler";
    getFocusOnConceal.value = options.getFocusOnConceal || null;
    return await reveal();
  }

  return { showConfirm };
}
