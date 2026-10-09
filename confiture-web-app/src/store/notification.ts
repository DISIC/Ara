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
    action?: {
      label: string;
      cb: () => void;
      hideOnTrigger?: boolean;
      srLabel?: string;
    };
    link?: { label: string; to: RouteLocationRaw };
    actionAfterClose?: () => void; // action to do after close
    timeout?: number;
  } | null;
}

interface NotificationOptions {
  action?: { label: string; srLabel?: string; cb: () => void; hideOnTrigger?: boolean; timeout?: number };
  link?: { label: string; to: RouteLocationRaw };
  actionAfterClose?: () => void;
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
      if (options?.action) {
        options.action.hideOnTrigger ??= true;
      }

      this.notification = {
        id: this.nextId++,
        description,
        title,
        status,
        ...options
      };
    },

    hideNotification() {
      if (this.notification?.actionAfterClose) {
        this.notification.actionAfterClose();
      }

      this.notification = null;
    }
  }
});
