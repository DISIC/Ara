<script lang="ts" setup>
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3";
import { onMounted, ref } from "vue";

defineProps(nodeViewProps);

const imgRef = ref<HTMLImageElement>();

onMounted(() => {
  imgRef.value?.addEventListener("load", handleImageLoad);
});

function handleImageLoad(e: Event) {
  const imgElement = e.target as HTMLImageElement;
  imgElement.removeEventListener("load", handleImageLoad);
  delete imgElement.dataset.loading;
  imgElement.style.removeProperty("background-image");
};
</script>

<template>
  <node-view-wrapper class="vue-component">
    <img
      ref="imgRef" v-bind="node.attrs"
      :style="`background-image: url('${node.attrs.localURL}')`"
      data-loading="true"
    >
  </node-view-wrapper>
</template>
