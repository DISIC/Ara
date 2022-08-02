import { onMounted, ref } from "vue";
import ky from "ky";

import { Audit } from "../types";

export function useAudit(uniqueId: string) {
  const data = ref<Audit>();
  const error = ref<any>();

  onMounted(async () => {
    try {
      // await new Promise((r) => setTimeout(r, 1000));
      data.value = await ky.get(`/api/audits/${uniqueId}`).json();
    } catch (e) {
      console.error(e);
      error.value = e;
    }
  });

  return {
    data,
    error,
  };
}
