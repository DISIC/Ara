import { ref } from "vue";
import { defineStore } from "pinia";

// interface SystemStoreState {
//   isOnline: boolean;
// }

export const useSystemStore = defineStore("system", {
  state() {
    const isOnline = ref(window.navigator.onLine);

    function onOnline() {
      isOnline.value = true;
    }

    function onOffline() {
      isOnline.value = false;
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return {
      isOnline
    };
  }
});
