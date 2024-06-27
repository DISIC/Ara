import { Ref, ref } from "vue";

let nextId = 1;

export function useUniqueId(): Ref<string> {
  const id = ref("" + nextId++);
  return id;
}
