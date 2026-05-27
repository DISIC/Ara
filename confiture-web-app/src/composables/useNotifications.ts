import { useNotificationStore } from "../store";

export function useNotifications() {
  const store = useNotificationStore();
  return store.showNotification;
}

export function useHideNotifications() {
  const store = useNotificationStore();
  return store.hideNotification;
}
