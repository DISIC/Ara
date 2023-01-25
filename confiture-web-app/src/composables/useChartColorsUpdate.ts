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
      getCssVarValue("--background-contrast-grey"),
    ];

    setNewColors(chart, newColors);
    chart?.update();
  }

  onMounted(() => {
    mediaQueryList.addEventListener("change", updateChartColors);
  });

  onUnmounted(() => {
    mediaQueryList.removeEventListener("change", updateChartColors);
  });
}
