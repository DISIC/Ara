import type { EventHookOn, UseConfirmDialogRevealResult } from "@vueuse/core";
import { useConfirmDialog } from "@vueuse/core";
import { defineStore } from "pinia";
import { nextTick } from "vue";

// See [useConfirmDialog | VueUse](https://vueuse.org/core/useConfirmDialog/)
const dialogLogic = useConfirmDialog();

interface DialogStoreState {
  dialogLogic: {
    reveal: (data?: any) => Promise<UseConfirmDialogRevealResult<any, any>>;
    confirm: (data?: any) => void;
    cancel: (data?: any) => any;
    onReveal: EventHookOn;
    onConfirm: EventHookOn;
    onCancel: EventHookOn;
  };
  dialogData: {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    getFocusOnConceal: (() => HTMLElement | null) | null;
    data?: any;
  } | null;
}

export const useDialogStore = defineStore("dialog", {
  state(): DialogStoreState {
    return {
      dialogLogic,
      dialogData: null
    };
  },
  actions: {
    async showDialog(
      title: string,
      message: string,
      confirmLabel: string,
      cancelLabel: string,
      getFocusOnConceal: (() => HTMLElement | null) | null,
      data?: any
    ): Promise<UseConfirmDialogRevealResult<any, boolean>> {
      this.dialogData = {
        title,
        message,
        confirmLabel,
        cancelLabel,
        getFocusOnConceal,
        data
      };
      await nextTick();
      return await dialogLogic.reveal(data);
    },

    resetDialogData() {
      this.dialogData = null;
    }
  }
});
