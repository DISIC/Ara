<script lang="ts" setup>
import { nodeViewProps, NodeViewWrapper } from "@tiptap/vue-3";
import { ref } from "vue";

const props = defineProps(nodeViewProps);

const isDragged = ref(false);

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
      v-bind="node.attrs"
      :class="{ 'is-dragged': isDragged }"
      :style="node.attrs.localURL ? `background-image: url('${node.attrs.localURL}')` : null"
      :data-loading="node.attrs.localURL ? true : null"
      @dragstart="isDragged = true"
      @dragend="isDragged = false"
      @mousedown="isDragged = true"
      @mouseup="isDragged = false"
      @load.once="handleImageLoad"
    >
  </node-view-wrapper>
</template>
