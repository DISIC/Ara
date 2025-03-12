<script lang="ts" setup>
import { ref } from "vue";

import Tiptap from "../components/ui/Tiptap.vue";

const content = ref();
</script>

<template>
  <h1>Hello world</h1>

  <Tiptap v-model="content" :editable="true" />
</template>
