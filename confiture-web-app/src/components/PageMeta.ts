import { defineComponent } from "vue";
import { useHead } from "@unhead/vue";

const PageMeta = defineComponent({
  name: "PageMeta",
  props: {
    title: {
      type: String,
      required: false,
      default: undefined,
    },
    description: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    /**
     * Define per-page meta tags.
     * If no props are provided, defaults are used.
     */
    useHead({
      title: () => props.title ?? "",
      meta: [
        { name: "description", content: props.description },
        { name: "og:title", content: props.title },
        { name: "og:description", content: props.description },
      ],
    });

    return () => null;
  },
});

export default PageMeta;
