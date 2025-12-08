/**
 * Only one modal at a time in the app!
 */
import { useConfirmDialog } from "@vueuse/core";
import { shallowRef } from "vue";

// Global state for modal content
const title = shallowRef("");
const message = shallowRef("");
const confirmLabel = shallowRef("");
const cancelLabel = shallowRef("");
const getFocusOnConceal = shallowRef<(() => HTMLElement | null) | null>(null);

const { reveal, confirm, cancel, onReveal, onConfirm, onCancel }
  = useConfirmDialog();

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

  return {
    // Dialog state
    title,
    message,
    confirmLabel,
    cancelLabel,

    // Dialog actions
    showConfirm,
    confirm,
    cancel,

    // Event listeners
    onReveal,
    onConfirm,
    onCancel,

    getFocusOnConceal
  };
}
