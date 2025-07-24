import { defineStore } from "pinia";
import { RouteLocationRaw } from "vue-router";

type NotificationStatus = "error" | "info" | "success" | "warning";

interface NotificationStoreState {
  nextId: number;
  notification: {
    id: number;
    status: NotificationStatus;
    title?: string;
    description?: string;
    action?: { label: string; cb: () => void };
    link?: { label: string; to: RouteLocationRaw };
  } | null;
}

interface NotificationOptions {
  action?: { label: string; cb: () => void };
  link?: { label: string; to: RouteLocationRaw };
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
        ...options
      };
    },

    hideNotification() {
      this.notification = null;
    }
  }
});
