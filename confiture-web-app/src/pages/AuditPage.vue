<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAudit } from "../api";
import Audit from "../components/Audit.vue";

const route = useRoute();
const auditUniqueId = route.params.uniqueId as string;
const { data, error } = useAudit(auditUniqueId);
</script>

<template>
  <p>This is the audit page : {{ auditUniqueId }}</p>
  <Audit v-if="data" :audit="data" />
  <p v-else-if="error">An error occured : {{ error }}</p>
</template>
