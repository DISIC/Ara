<script lang="ts" setup>
import Chart, { ChartConfiguration } from "chart.js/auto";
import { ref, onMounted, onUnmounted } from "vue";

import { getCssVarValue } from "../utils";
import { useChartColorsUpdate } from "../composables/useChartColorsUpdate";

interface DataItem {
  name: string;
  compliant: {
    raw: number;
    percentage: number;
  };
  notCompliant: {
    raw: number;
    percentage: number;
  };
  notApplicable: {
    raw: number;
    percentage: number;
  };
}

const props = defineProps<{
  data: DataItem[];
}>();

const chartLabels = props.data.map((item) => item.name);
const chartDatasets = [
  {
    label: "Conforme",
    data: props.data.map((d) => d.compliant.percentage),
    backgroundColor: getCssVarValue("--background-action-high-success"),
    barThickness: 16,
  },
  {
    label: "Non conforme",
    data: props.data.map((d) => d.notCompliant.percentage),
    backgroundColor: getCssVarValue("--background-action-high-error"),
    barThickness: 16,
  },
  {
    label: "Non applicable",
    data: props.data.map((d) => d.notApplicable.percentage),
    backgroundColor: getCssVarValue("--background-contrast-grey"),
    barThickness: 16,
  },
];

const chartConfiguration: ChartConfiguration<"bar", number[], string> = {
  type: "bar",
  data: {
    labels: chartLabels,
    datasets: chartDatasets,
  },

  options: {
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const data = props.data.find((item) => item.name === context.label);

            const key = ["compliant", "notCompliant", "notApplicable"][
              context.datasetIndex
            ] as keyof DataItem;

            return `${context.dataset.label} : ${
              (data![key] as { raw: number; percentage: number }).raw
            }`;
          },
        },
      },
    },
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false,
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        stacked: true,
        ticks: {
          color: getCssVarValue("--text-mention-grey"),
          font: {
            weight: "bold",
            family: "Marianne",
          },
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: getCssVarValue("--text-mention-grey"),
          font: {
            weight: "500",
            family: "Marianne",
          },
        },
      },
    },
  },
};

const canvas = ref<HTMLCanvasElement>();
let chart: Chart;

onMounted(() => {
  chart = new Chart(canvas.value!, chartConfiguration);
});

onUnmounted(() => {
  chart.destroy();
});

useChartColorsUpdate(
  () => chart,
  (chart, newColors) => {
    chart.data.datasets[0].backgroundColor = newColors[0];
    chart.data.datasets[1].backgroundColor = newColors[1];
    chart.data.datasets[2].backgroundColor = newColors[2];
  }
);
</script>

<template>
  <div
    :style="{
      height: data.length * 40 + 24 + 'px',
      position: 'relative',
      width: '100%',
    }"
  >
    <canvas ref="canvas" aria-hidden="true" />
  </div>
</template>
