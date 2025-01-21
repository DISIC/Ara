import ky from "ky";
import { defineStore } from "pinia";
import { ref } from "vue";

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

    async function pruneUploads() {
      await ky.post(`/api/system/prune-uploads`);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return {
      isOnline,
      pruneUploads
    };
  }
});
