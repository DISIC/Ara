<script lang="ts" setup>
import { mergeAttributes } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Heading, type Level } from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent, useEditor } from "@tiptap/vue-3";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
// load common languages
import { common, createLowlight } from "lowlight";
import { computed, onBeforeUnmount, ShallowRef } from "vue";

import TiptapButton from "./TiptapButton.vue";

// import { AraTiptapExtension, CustomSelectionExtension } from "../../tiptap";
// import {
//   ImageUploadTiptapExtension,
//   insertFilesAtSelection,
//   UploadFn
// } from "../../tiptap/ImageUploadTiptapExtension";

// const isDevMode = useDevMode();

const HEADINGS_LEVELS = [2, 3, 4, 5, 6] as Array<Level>;
const displayedHeadings = computed(() => HEADINGS_LEVELS.slice(0, 3));

// create a lowlight instance
const lowlight = createLowlight(common);

// you can also register languages
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

export interface Props {
  content?: string | null;
  editable?: boolean;
  labelledBy?: string | null;
  // uploadFn?: UploadFn | null;
}

const props = withDefaults(defineProps<Props>(), {
  content: "",
  editable: true,
  labelledBy: null
  // uploadFn: null
});

const emit = defineEmits(["update:content"]);

function getContent() {
  let jsonContent = null;
  if (props.content) {
    try {
      jsonContent = JSON.parse(props.content);
    } catch {
      jsonContent = props.content;
    }
  }

  return jsonContent;
}

let editorAttributes: any = {
  "aria-describedby": "tiptap-description",
  rows: "10",
  "aria-multiline": "true",
  role: "textbox"
};
if (props.labelledBy) {
  editorAttributes["aria-labelledby"] = props.labelledBy;
}

let extensions = [
  //   AraTiptapExtension,
  Heading.extend({
    // prevent all marks from being applied to headings
    marks: ""
  }).configure({
    levels: HEADINGS_LEVELS
  }),
  StarterKit.configure({
    codeBlock: false,
    dropcursor: false,
    heading: false
  }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: "html" }),
  Highlight,
  Link.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        class: {
          default: null,
          renderHTML: () => {
            return { class: null }; // reset class when copy pasting for example
          }
        },
        title: {
          default: null,
          renderHTML: (attributes) => {
            return {
              title: attributes.title
            };
          }
        }
      };
    },
    renderHTML({ HTMLAttributes }) {
      return ["a", mergeAttributes(HTMLAttributes), 0];
    }
  }).configure({
    openOnClick: false,
    defaultProtocol: "https"
  }),
  //   Markdown,
  TaskItem,
  TaskList,
  //   ImageExtension.extend({
  //     addAttributes() {
  //       return {
  //         ...this.parent?.(),
  //         width: {
  //           default: "0"
  //         },
  //         height: {
  //           default: "0"
  //         }
  //       };
  //     }
  //   }).configure({ inline: false }),
  Typography.configure({
    openDoubleQuote: "« ",
    closeDoubleQuote: " »"
  })
  //   CustomSelectionExtension
];
// if (props.editable) {
//   extensions.push(
//     ...[
//       DropCursor.configure({ color: "var(--dsfr-outline)", width: 3 }),
//       ImageUploadTiptapExtension.configure({
//         uploadFn: props.uploadFn
//       })
//     ]
//   );
// }

const editor = useEditor({
  editorProps: {
    attributes: editorAttributes
  },
  editable: props.editable,
  content: getContent(),
  extensions,
  onUpdate({ editor }) {
    // The content has changed.
    emit("update:content", JSON.stringify(editor.getJSON()));
  }
}) as ShallowRef<Editor>;

// const browseInput = ref<InstanceType<typeof HTMLInputElement>>();
// onMounted(() => {
//   if (props.uploadFn) {
//     browseInput.value?.addEventListener(
//       "change",
//       (e: Event) => {
//         const inputElement = e?.target as HTMLInputElement;
//         const files = inputElement.files!;
//         insertFilesAtSelection(props.uploadFn!, editor.value, files);
//       },
//       false
//     );
//   }
// });

onBeforeUnmount(() => {
  editor.value?.destroy();
});

function setLink() {
  const previousUrl = editor.value.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === "") {
    editor.value.chain().focus().extendMarkRange("link").unsetLink().run();

    return;
  }

  // update link
  editor.value
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

// function onImageAdd() {
//   if (browseInput.value) {
//     browseInput.value.value = "";
//   }
//   browseInput.value?.click();
// }

// function onRecycle() {
//   const systemStore = useSystemStore();
//   systemStore.pruneUploads();
// }
</script>

<template>
  <div
    class="tiptap-container"
    :class="editable ? 'tiptap-container--editable' : null"
  >
    <p id="tiptap-description" class="fr-sr-only">
      Éditeur de texte riche, vous pouvez utiliser le format Markdown ou bien
      utiliser les raccourcis clavier.
    </p>
    <editor-content :editor="editor" />
    <ul v-if="editable" class="tiptap-buttons">
      <li>
        <ul>
          <li>
            <TiptapButton
              label="Mettre en gras"
              switch-off-label="Retirer le gras"
              icon="bold"
              :is-toggle="true"
              :disabled="!editor?.can().toggleBold()"
              :pressed="editor?.isActive('bold')"
              @click="editor.chain().focus().toggleBold().run()"
            />
          </li>
          <li>
            <TiptapButton
              label="Mettre en italique"
              switch-off-label="Retirer l’italique"
              icon="italic"
              :is-toggle="true"
              :disabled="!editor?.can().toggleItalic()"
              :pressed="editor?.isActive('italic')"
              @click="editor.chain().focus().toggleItalic().run()"
            />
          </li>
          <li>
            <TiptapButton
              label="Barrer le texte"
              switch-off-label="Ne pas barrer le texte"
              icon="strikethrough"
              :is-toggle="true"
              :disabled="!editor?.can().toggleStrike()"
              :pressed="editor?.isActive('strike')"
              @click="editor.chain().focus().toggleStrike().run()"
            />
          </li>
          <li v-for="(hLevel, i) in displayedHeadings" :key="i">
            <TiptapButton
              :label="`Passer en titre de niveau ${i + 1}`"
              :switch-off-label="`Retirer le niveau de titre ${i + 1}`"
              :icon="`h-${i + 1}`"
              :is-toggle="true"
              :disabled="
                !editor?.can().toggleHeading({ level: hLevel as Level })
              "
              :pressed="editor?.isActive('heading', { level: hLevel })"
              @click="
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: hLevel as Level })
                  .run()
              "
            />
          </li>
        </ul>
      </li>
      <li>
        <ul>
          <li>
            <TiptapButton
              label="Ajouter un lien"
              switch-off-label="Éditer le lien"
              icon="link"
              :is-toggle="true"
              :disabled="!editor?.can().setLink({ href: 'test' })"
              :pressed="editor?.isActive('link')"
              @click="setLink"
            />
          </li>
        </ul>
      </li>
      <li>
        <ul>
          <li>
            <TiptapButton
              label="Passer en liste non ordonnée"
              switch-off-label="Retirer les puces de liste"
              icon="list-unordered"
              :is-toggle="true"
              :disabled="
                !editor?.can().toggleBulletList() &&
                !editor?.can().toggleOrderedList()
              "
              :pressed="editor?.isActive('bulletList')"
              @click="editor.chain().focus().toggleBulletList().run()"
            />
          </li>
          <li>
            <TiptapButton
              label="Passer en liste ordonnée"
              switch-off-label="Retirer les numéros de liste"
              icon="list-ordered"
              :is-toggle="true"
              :disabled="
                !editor?.can().toggleBulletList() &&
                !editor?.can().toggleOrderedList()
              "
              :pressed="editor?.isActive('orderedList')"
              @click="editor.chain().focus().toggleOrderedList().run()"
            />
          </li>
        </ul>
      </li>
      <li>
        <ul>
          <li>
            <TiptapButton
              label="Définir comme passage de code"
              switch-off-label="Ne pas définir comme passage de code"
              icon="code-view"
              :is-toggle="true"
              :disabled="!editor?.can().toggleCode()"
              :pressed="editor?.isActive('code')"
              @click="editor.chain().focus().toggleCode().run()"
            />
          </li>
          <li>
            <TiptapButton
              label="Définir comme bloc de code"
              switch-off-label="Ne pas définir comme bloc de code"
              icon="code-block"
              :is-toggle="true"
              :disabled="!editor?.can().toggleCodeBlock()"
              :pressed="editor?.isActive('codeBlock')"
              @click="editor.chain().focus().toggleCodeBlock().run()"
            />
          </li>
        </ul>
      </li>
      <!-- <li>
        <TiptapButton
          label="Insérer une image"
          icon="image-add-line"
          :label-visible="true"
          @click="onImageAdd"
        />
        <input
          id="tiptap-browse-input"
          ref="browseInput"
          type="file"
          class="fr-hidden"
          hidden
          multiple
        />
      </li> -->
      <!--
			<li>
        <TiptapButton
          v-if="isDevMode"
          label="Nettoyage des images obsolètes"
          icon="recycle-line"
          @click="onRecycle"
        />
      </li>
			-->
    </ul>
  </div>
</template>

<style>
/* Tiptap */
.tiptap-container {
  position: relative;
}

.tiptap {
  background-color: var(--background-alt-grey);
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 1rem 1.5rem;
  border: 0 solid var(--border-plain-grey);
  border-bottom-width: 1px;
  min-height: 30rem;
  overflow-y: auto;
}

.tiptap-container--editable .tiptap {
  padding-top: 4rem;
}

.tiptap img {
  cursor: pointer;
  display: block;
  height: auto;
  max-width: 100%;
  border-radius: 0.25rem;
  margin: 0.5rem 0 2rem;
  padding: 0.5rem;
}

.tiptap:focus,
.tiptap:focus-visible {
  outline-width: 3px !important;
  outline-offset: 0 !important;
}

@media (hover: hover) and (pointer: fine) {
  .tiptap img:hover {
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
}

.tiptap p {
  vertical-align: middle;
}

/* Testing some different UI for Tiptap editor: */
/* .tiptap[contenteditable]:not([contenteditable="false"]),
.tiptap[tabindex] {
  color: rgba(10, 118, 246, 0);
  transition: outline-color 0.3s ease-in;
}

.tiptap[contenteditable]:not([contenteditable="false"]):focus,
.tiptap[tabindex]:focus {
  outline-color: rgba(10, 118, 246, 0.2);
  outline-offset: 2px;
  outline-width: 500px;
} */

.tiptap pre {
  padding: 0.75rem;
}
.tiptap code {
  font-size: 85%;
}
.tiptap :not(pre) code {
  padding: 0.2em 0.4em;
}
.tiptap pre,
.tiptap code {
  background-color: var(--background-contrast-overlap-grey);
  border-radius: 0.25rem;
}
.tiptap blockquote:before {
  --icon-size: 2rem;
  color: var(--artwork-minor-blue-france);
  content: "";
  display: block;
  margin-bottom: 0.5rem;
  background-color: currentColor;
  display: inline-block;
  flex: 0 0 auto;
  height: var(--icon-size);
  mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTE0IDNhOCA4IDAgMSAxIDAgMTZ2My41Yy01LTItMTItNS0xMi0xMS41YTggOCAwIDAgMSA4LThoNFptMCAyaC00YTYgNiAwIDAgMC02IDZjMCAzLjYxIDIuNDYyIDUuOTY2IDggOC40OFYxN2gyYTYgNiAwIDEgMCAwLTEyWm0tMiAyLjUtMi41MDYgMy43NUwxMiAxNUg5LjI5NUw2Ljc1IDExLjI1IDkuMjk1IDcuNUgxMlptNC41IDAtMi41MDYgMy43NUwxNi41IDE1aC0yLjcwNWwtMi41NDUtMy43NSAyLjU0NS0zLjc1SDE2LjVaIi8+PC9zdmc+);
  mask-size: 100% 100%;
  width: var(--icon-size);
}

.tiptap blockquote p {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 2rem;
}

.tiptap li > p {
  margin-bottom: 0.25em;
}

/* FIXME: tiptap tasklist are not accessible yet. */
/* https://github.com/ueberdosis/tiptap/issues/4774 */
.tiptap ul[data-type="taskList"] {
  list-style: none;
  margin-left: 0;
  padding: 0;
}

.tiptap ul[data-type="taskList"] li {
  align-items: flex-start;
  display: flex;
}

.tiptap ul[data-type="taskList"] li > label {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}

.tiptap ul[data-type="taskList"] li > div {
  flex: 1 1 auto;
}

.tiptap ul[data-type="taskList"] li > div p {
  margin-bottom: 0.25em;
}

.tiptap ul[data-type="taskList"] input[type="checkbox"] {
  cursor: pointer;
}

.tiptap ul[data-type="taskList"] ul[data-type="taskList"] {
  margin: 0;
}

.tiptap-buttons,
.tiptap-buttons ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tiptap-buttons {
  margin: 0.5rem 0.75rem;
  width: calc(100% - 1.5rem);
  position: absolute;
  overflow-x: auto;
  white-space: nowrap;
  top: 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}
.titptap-buttons::-webkit-scrollbar {
  /* WebKit */
  width: 0;
  height: 0;
}

.tiptap-buttons li,
.tiptap-buttons ul {
  display: inline-block;
}

.tiptap-buttons li + li {
  margin-left: 0.2rem;
}

.tiptap-buttons > li + li:before {
  box-shadow: inset 0 0 0 1px #ddd;
  box-shadow: inset 0 0 0 1px var(--border-default-grey);
  content: "";
  display: inline-block;
  height: 1.5rem;
  padding: 0;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  position: relative;
  vertical-align: baseline;
  width: 1px;
}

.tiptap-buttons .fr-btn--tertiary {
  color: var(--text-defult-grey);
  box-shadow: none;
  border-radius: 0.2rem;
}
.tiptap-buttons .fr-btn--tertiary:not([aria-pressed="true"]) {
  --hover-tint: var(--background-alt-grey-hover);
}

.tiptap-buttons .fr-btn--tertiary[disabled] {
  box-shadow: unset;
  opacity: 0.5;
}

.tiptap-buttons .fr-btn--tertiary:not(:disabled):active {
  background-color: var(--background-alt-grey-active);
}

.tiptap-buttons .fr-btn--tertiary[aria-pressed="true"] {
  background-color: var(--background-alt-grey-active);
}

.tiptap-buttons .fr-btn--tertiary[aria-pressed="true"]:hover {
  background-color: var(--background-alt-grey-hover);
}

/* @media (width < 36rem) {
  .tiptap-buttons .fr-btn--icon-left[class*=" fr-icon-"] {
    overflow: hidden;
    max-width: 2.5rem;
    max-height: 2.5rem;
  }
} */

.tiptap-selection,
.ProseMirror-selectednode {
  outline-style: dotted;
  outline-width: 2px;
  outline-color: var(--dsfr-outline);
}

.ProseMirror-widget {
  opacity: 0.5;
}

/* Extra icons */
.fr-icon-strikethrough::before,
.fr-icon-strikethrough::after {
  mask-image: url("../../assets/images/strikethrough.svg");
}
.fr-icon-code-block::before,
.fr-icon-code-block::after {
  mask-image: url("../../assets/images/code-block.svg");
}

.tiptap-buttons .fr-btn--icon-left[class*="fr-icon-image-add-line"] {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.tiptap-buttons .fr-btn--icon-left[class*="fr-icon-image-add-line"]:before {
  --icon-size: 1.5rem;
}
</style>
