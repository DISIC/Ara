import type { Chart } from "chart.js";
import { onMounted, onUnmounted } from "vue";

import { getCssVarValue } from "../utils";

/**
 * Update chart colors when switching color scheme.
 * @param getChart Chart instance getter
 * @param setNewColors Called when the chart colors need to be updated.
 *
 * @example
 * useChartColorsUpdate(
 *   () => chart,
 *   (chart, newColors) => {
 *     chart.data.datasets[0].backgroundColor = newColors;
 *   }
 * );
 */
export function useChartColorsUpdate(
  getChart: () => Chart,
  setNewColors: (chart: Chart, newColors: string[]) => void
) {
  const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

  function updateChartColors() {
    const chart = getChart();

    const newColors = [
      getCssVarValue("--background-action-high-success"),
      getCssVarValue("--background-action-high-error"),
      getCssVarValue("--grey-200-850")
    ];

    setNewColors(chart, newColors);
    chart?.update();
  }

  // Update chart colors on `data-fr-theme` attribute change
  const observer = new MutationObserver((mutationList) => {
    if (!mutationList.some((m) => m.attributeName === "data-fr-theme")) {
      return;
    }

    updateChartColors();
  });

  onMounted(() => {
    mediaQueryList.addEventListener("change", updateChartColors);
    observer.observe(document.documentElement, { attributes: true });
  });

  onUnmounted(() => {
    mediaQueryList.removeEventListener("change", updateChartColors);
    observer.disconnect();
  });
}
