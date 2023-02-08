<script lang="ts">
import { Chart as ChartJS, PieController, ArcElement } from "chart.js";

ChartJS.register(PieController, ArcElement);
</script>

<script lang="ts" setup>
import { Chart, ChartConfiguration } from "chart.js";
import { onMounted, onUnmounted, ref } from "vue";

import { getCssVarValue } from "../utils";
import { useChartColorsUpdate } from "../composables/useChartColorsUpdate";

const props = defineProps<{
  compliant: number;
  notCompliant: number;
  notApplicable: number;
}>();

const chartConfig: ChartConfiguration<"pie", number[], string> = {
  type: "pie",
  data: {
    labels: ["Conforme", "Non conforme", "Non applicable"],
    datasets: [
      {
        data: [props.compliant, props.notCompliant, props.notApplicable],
        backgroundColor: [
          getCssVarValue("--background-action-high-success"),
          getCssVarValue("--background-action-high-error"),
          getCssVarValue("--border-plain-grey"),
        ],
        borderWidth: 0,
      },
    ],
  },
  options: {
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  },
};

const canvas = ref<HTMLCanvasElement>();
let chart: Chart;

onMounted(() => {
  chart = new Chart(canvas.value!, chartConfig);
});

onUnmounted(() => {
  chart.destroy();
});

useChartColorsUpdate(
  () => chart,
  (chart, newColors) => {
    chart.data.datasets[0].backgroundColor = newColors;
  }
);
</script>

<template>
  <div class="pie-chart-container fr-m-5v">
    <canvas ref="canvas" aria-hidden="true"></canvas>
  </div>
</template>

<style scoped>
.pie-chart-container {
  max-width: 25rem;
}
</style>
