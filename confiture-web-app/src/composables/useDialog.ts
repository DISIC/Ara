/**
 * Only one modal at a time in the app!
 */
import { DialogData, useDialogStore } from "../store";

export function useDialog() {
  const store = useDialogStore();
  async function showConfirm(dialogState: DialogData) {
    return await store.showDialog(dialogState);
  }

  return { showConfirm };
}
