/**
 * Only one modal at a time in the app!
 */
import { useDialogStore } from "../store";

export function useDialog() {
  const store = useDialogStore();
  return { showConfirm: store.showDialog };
}
