import { defineStore } from "pinia";

export interface DialogData {
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmAction?: {
    cb?: () => void;
    focus?: () => HTMLElement | null;
  };
}
interface DialogStoreState {
  dialog?: DialogData | null;
}

export const useDialogStore = defineStore("dialog", {
  state: (): DialogStoreState => {
    return {
      dialog: null
    };
  },
  actions: {
    async showDialog(options: DialogData) {
      this.dialog = { ...options, cancelLabel: options.cancelLabel || "Annuler" };
    },

    resetDialogData() {
      this.dialog = null;
    }
  }
});
