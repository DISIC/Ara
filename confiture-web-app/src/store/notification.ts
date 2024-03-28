import { defineStore } from "pinia";

type NotificationStatus = "error" | "info" | "success" | "warning";

interface NotificationStoreState {
  nextId: number;
  notification: {
    id: number;
    status: NotificationStatus;
    title?: string;
    /** Can be styled using markdown. */
    description?: string;
    action?: { label: string; cb: () => void };
  } | null;
}

interface NotificationOptions {
  action?: { label: string; cb: () => void };
}

export const useNotificationStore = defineStore("notification", {
  state(): NotificationStoreState {
    return {
      nextId: 1,
      notification: null
    };
  },
  actions: {
    showNotification(
      status: NotificationStatus,
      title?: string,
      description?: string,
      options?: NotificationOptions
    ) {
      this.notification = {
        id: this.nextId++,
        description,
        title,
        status,
        ...(options?.action && { action: options.action })
      };
    },

    hideNotification() {
      this.notification = null;
    }
  }
});
