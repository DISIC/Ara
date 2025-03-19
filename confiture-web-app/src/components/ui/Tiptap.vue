<script lang="ts" setup>
import { mergeAttributes, textblockTypeInputRule } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import DropCursor from "@tiptap/extension-dropcursor";
import { Heading, type Level } from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent, useEditor } from "@tiptap/vue-3";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { common, createLowlight } from "lowlight";
import { onBeforeUnmount, ShallowRef } from "vue";

import TiptapButton from "./TiptapButton.vue";

export interface Props {
  modelValue?: string | null;
  editable?: boolean;
  labelledBy?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  editable: true,
  labelledBy: null
});

const emit = defineEmits(["update:modelValue"]);

// Define needed heading levels
const displayedHeadings = [4, 5, 6] as Array<Level>;

// LowLight languages
const lowlight = createLowlight(common);

lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

function getContent() {
  let jsonContent = null;
  if (props.modelValue) {
    try {
      jsonContent = JSON.parse(props.modelValue);
    } catch {
      jsonContent = props.modelValue;
    }
  }

  return jsonContent;
}

function setLink() {
  const previousUrl = editor.value.getAttributes("link").href;
  const url = window.prompt("Adresse du lien", previousUrl);

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

// Editor attributes to create an accessible textarea
const editorAttributes: any = {
  "aria-describedby": "tiptap-description",
  rows: "10",
  "aria-multiline": "true",
  role: "textbox"
};

if (props.labelledBy) {
  editorAttributes["aria-labelledby"] = props.labelledBy;
}

const extensions = [
  Heading.extend({
    // prevent all marks from being applied to headings
    marks: "",
    // Shift heading levels when typing markdown
    // Example: "## Foobar" would render a `h5`
    addInputRules() {
      return this.options.levels.map((level) => {
        return textblockTypeInputRule({
          find: new RegExp(
            `^(#{${Math.min(...this.options.levels) - 3},${level - 3}})\\s$`
          ),
          type: this.type,
          getAttributes: {
            level
          }
        });
      });
    }
  }).configure({
    levels: displayedHeadings
  }),
  StarterKit.configure({
    codeBlock: false,
    dropcursor: false,
    heading: false
  }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: "html" }),
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
  Typography.configure({
    openDoubleQuote: "« ",
    closeDoubleQuote: " »"
  })
];

if (props.editable) {
  extensions.push(
    // Improve visibility of selected dragged block
    // TODO: fix this TS issue
    // @ts-expect-error DropCursor options
    DropCursor.configure({ color: "var(--dsfr-outline)", width: 3 })
  );
}

const editor = useEditor({
  editorProps: {
    attributes: editorAttributes
  },
  editable: props.editable,
  content: getContent(),
  extensions,
  onUpdate({ editor }) {
    // The content has changed.
    emit("update:modelValue", JSON.stringify(editor.getJSON()));
  }
}) as ShallowRef<Editor>;

onBeforeUnmount(() => {
  editor.value?.destroy();
});
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
              label="Définir comme citation"
              switch-off-label="Ne pas définir comme citation"
              icon="quote-line"
              :is-toggle="true"
              :disabled="!editor?.can().toggleBlockquote()"
              :pressed="editor?.isActive('blockquote')"
              @click="editor.chain().focus().toggleBlockquote().run()"
            />
          </li>
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
    </ul>
    <editor-content :editor="editor" />
  </div>
</template>

<style>
@import url("highlight.js/styles/github.css") screen and
  (prefers-color-scheme: light);
@import url("highlight.js/styles/github-dark.css") screen and
  (prefers-color-scheme: dark);

.tiptap-container {
  position: relative;
  background-color: var(--background-alt-grey);
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 0.5rem 0.75rem;
  border: 0 solid var(--border-plain-grey);
  border-bottom-width: 1px;
  min-height: 30rem;
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
  margin-bottom: 0.5rem;
  background-color: currentColor;
  display: inline-block;
  height: var(--icon-size);
  mask-image: url("@gouvfr/dsfr/dist/icons/editor/fr--quote-line.svg");
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

.tiptap-buttons,
.tiptap-buttons ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tiptap-buttons {
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--background-alt-grey);
  margin-block-end: 0.5rem;
  padding-block: 0.25rem;
  width: calc(100% + 1.5rem);
  transform: translateX(-0.75rem);
  padding-inline: 0.75rem;
}

.titptap-buttons::-webkit-scrollbar {
  /* WebKit */
  width: 0;
  height: 0;
}

.tiptap-buttons li {
  padding: 0;
}

.tiptap-buttons li,
.tiptap-buttons ul {
  display: inline-block;
}

.tiptap-buttons li + li {
  margin-left: 0.2rem;
}

.tiptap-buttons > li + li::before {
  box-shadow: inset 0 0 0 1px #ddd;
  box-shadow: inset 0 0 0 1px var(--border-default-grey);
  content: "";
  display: inline-block;
  height: 1.5rem;
  padding: 0;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  position: relative;
  vertical-align: middle;
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

.tiptap-buttons .fr-btn--icon-left[class*="fr-icon-image-add-line"]::before {
  --icon-size: 1.5rem;
}
</style>
