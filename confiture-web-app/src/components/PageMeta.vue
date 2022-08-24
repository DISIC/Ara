<script setup lang="ts">
import { useHead } from "@vueuse/head";

const props = defineProps<{
  title?: string;
  description?: string;
}>();

/**
 * Define per-page meta tags.
 * If no props are provided, defaults are used.
 */
useHead({
  title: props.title,
  titleTemplate: "%s | Confiture",
  meta: [
    { name: "description", content: props.description },
    { name: "og:title", content: props.title },
    { name: "og:description", content: props.description },
  ],
});
</script>
