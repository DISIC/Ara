import { ref } from "vue";

export function useWindowWidth() {
  const width = ref(window.innerWidth);

  function setWidth() {
    width.value = window.innerWidth;
  }

  window.addEventListener("resize", setWidth);

  return width;
}
