// Composant inspiré de Raddix
// https://raddix.dev/hooks/use-scroll-spy
// https://github.com/insoftlabs/raddix/blob/main/packages/hooks/use-scroll-spy/src/index.ts

// Scrollspy demystified : https://blog.maximeheckel.com/posts/scrollspy-demystified/

import { ref, onMounted, onBeforeUnmount, watch } from "vue";

export function useScrollSpy(
  items: string[],
  options?: IntersectionObserverInit
) {
  const activeId = ref("");
  let observer: IntersectionObserver | null = null;

  const createObserver = () => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeId.value = `#${entry.target.id}`;
        }
      });
    }, options);

    items.forEach(id => {
      if (!id) return;

      const element = document.querySelector(id);
      if (element) {
        observer?.observe(element);

        // Par défaut, le premier lien du menu doit être marqué comme actif
        if (!activeId.value) {
          activeId.value = id;
        }
      }
    });
  };

  onMounted(() => {
    createObserver();
  });

  watch(
    () => [items, options],
    () => {
      observer?.disconnect();
      createObserver();
    },
    { deep: true }
  );

  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return activeId;
}
