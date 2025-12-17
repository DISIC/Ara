import { useConfirmDialog } from "@vueuse/core";
import { shallowRef } from "vue";

// See [useConfirmDialog | VueUse](https://vueuse.org/core/useConfirmDialog/)
export const confirmDialog = useConfirmDialog();

// Global state for modal content
const title = shallowRef("");
const message = shallowRef("");
const confirmLabel = shallowRef("");
const cancelLabel = shallowRef("");
const getFocusOnConceal = shallowRef<(() => HTMLElement | null) | null>(null);

export function useGenericModal() {
  return {
    // state
    title,
    message,
    confirmLabel,
    cancelLabel,

    // hooks
    getFocusOnConceal
  };
}
