// Component inspired by Raddix
// https://raddix.dev/hooks/use-scroll-spy
// https://github.com/insoftlabs/raddix/blob/main/packages/hooks/use-scroll-spy/src/index.ts

// Scrollspy demystified : https://blog.maximeheckel.com/posts/scrollspy-demystified/

import { ref, onMounted, onBeforeUnmount, watch } from "vue";

export interface Section {
  id: string;
  selector: string;
}

interface SectionElement {
  section: Section;
  element: Element;
}

export function useScrollSpy(
  items: Section[],
  options?: IntersectionObserverInit
) {
  const activeId = ref("");
  const elements: SectionElement[] = [];
  let observer: IntersectionObserver | null = null;

  const createObserver = () => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
          const element: SectionElement | undefined = elements.find(x => x.element === entry.target);
          if (element) {
            activeId.value = element.section.id;
          }
        }
      });
    }, options);

    items.forEach((section: Section) => {
      const element: Element | null = document.querySelector(section.selector);
      if (element) {
        observer?.observe(element);
        elements.push({ section, element });

        // By default, the first link in the menu should be marked as active.
        if (!activeId.value) {
          activeId.value = section.id;
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
