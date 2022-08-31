import { defineStore } from "pinia";

type NotificationStatus = "error" | "info" | "success" | "warning";

interface NotificationStoreState {
  nextId: number;
  notification: {
    id: number;
    status: NotificationStatus;
    title: string;
    description: string;
  } | null;
}

export const useNotificationStore = defineStore("notification", {
  state(): NotificationStoreState {
    return {
      nextId: 1,
      notification: null,
    };
  },
  actions: {
    showNotification(
      status: NotificationStatus,
      title: string,
      description: string
    ) {
      this.notification = {
        id: this.nextId++,
        description,
        title,
        status,
      };
    },

    hideNotification() {
      this.notification = null;
    },
  },
});
