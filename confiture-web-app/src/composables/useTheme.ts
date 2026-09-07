import { useEventListener } from "@vueuse/core";
import { ref } from "vue";

export type Theme = "light" | "dark";

/**
 * Thème (clair ou sombre) actuellement appliqué par le DSFR.
 *
 * Le DSFR pose le thème résolu sur `<html data-fr-theme>` et émet un événement
 * `dsfr.theme` (non bubblant) sur cet élément à chaque changement, que ce soit
 * via la modale de paramètres d’affichage ou via les préférences système.
 */
export function useTheme() {
  const theme = ref<Theme>(
    (document.documentElement.getAttribute("data-fr-theme") as Theme | null) ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );

  useEventListener(document.documentElement, "dsfr.theme", (e: Event) => {
    theme.value = (e as CustomEvent<{ theme: Theme }>).detail.theme;
  });

  return theme;
}
