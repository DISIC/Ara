<script setup lang="ts">
import { Audit } from "../types";

defineProps<{
  audit: Audit;
}>();
</script>

<template>
  <div>An audit of {{ audit.procedure }}.</div>
</template>
