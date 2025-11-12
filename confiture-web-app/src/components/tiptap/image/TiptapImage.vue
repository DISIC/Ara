<script lang="ts" setup>
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3";
import { ref } from "vue";

const props = defineProps(nodeViewProps);

const imgRef = ref<HTMLImageElement>();

function handleImageLoad(e: Event) {
  const imgElement = e.target as HTMLImageElement;
  delete imgElement.dataset.loading;
  imgElement.style.removeProperty("background-image");
  props.updateAttributes({
    localURL: null
  });
  URL.revokeObjectURL(props.node.attrs.localURL);
};
</script>

<template>
  <node-view-wrapper class="vue-component">
    <img
      ref="imgRef"
      v-bind="node.attrs"
      :style="node.attrs.localURL ? `background-image: url('${node.attrs.localURL}')` : null"
      :data-loading="node.attrs.localURL ? true : null"
      @load.once="handleImageLoad"
    >
  </node-view-wrapper>
</template>
