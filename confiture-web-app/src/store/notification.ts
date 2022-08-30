import { defineStore } from "pinia";

type NotificationStatus = "error" | "info" | "success" | "warning";

interface NotificationStoreState {
  notification: {
    status: NotificationStatus;
    title: string;
    description: string;
  } | null;
}

export const useNotificationStore = defineStore("notification", {
  state(): NotificationStoreState {
    return {
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
