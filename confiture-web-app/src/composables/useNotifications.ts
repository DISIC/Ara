import { useNotificationStore } from "../store";

export function useNotifications() {
  const store = useNotificationStore();
  return store.showNotification;
}
