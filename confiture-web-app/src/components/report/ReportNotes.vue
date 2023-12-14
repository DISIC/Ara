<script lang="ts" setup>
import MarkdownRenderer from "./MarkdownRenderer.vue";
import { useReportStore } from "../../store";

const report = useReportStore();
</script>

<template>
  <MarkdownRenderer :markdown="report.data?.notes!" />
</template>
