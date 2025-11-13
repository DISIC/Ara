<script lang="ts" setup>
import type { Level } from "@tiptap/extension-heading";
import { Editor, EditorContent, useEditor } from "@tiptap/vue-3";
import { onBeforeUnmount, ShallowRef, useId, useTemplateRef, watch } from "vue";

import { insertFilesAtSelection } from "./image/ImageUploadExtension";
import { displayedHeadings, getTiptapEditorExtensions } from "./tiptap-extensions";
import TiptapButton from "./TiptapButton.vue";

export interface Props {
  modelValue?: string | null;
  editable?: boolean;
  labelledBy?: string | null;
  describedBy?: string | null;
  disabled?: boolean;
  editorSize?: "sm" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  editable: true,
  disabled: false,
  labelledBy: null,
  describedBy: null,
  editorSize: "sm"
});

const emit = defineEmits<{
  (event: "image:uploaded", value: string): void;
  (event: "update:modelValue", value: string): void;
}>();

const uniqueId = useId();

function getContent() {
  let jsonContent = null;
  if (props.modelValue) {
    try {
      jsonContent = JSON.parse(props.modelValue);
    } catch {
      // not json, most likely markdown
      jsonContent = props.modelValue;
    }
  }

  return jsonContent;
}

function setLink() {
  const previousUrl = editor.value.getAttributes("link").href;
  // eslint-disable-next-line no-alert
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
const editorAttributes: any = props.editable
  ? {
      "aria-multiline": "true",
      "role": "textbox",
      "class": `tiptap--${props.editorSize}`
    }
  : {
      class: "tiptap--not-editable"
    };

if (props.labelledBy) {
  editorAttributes["aria-labelledby"] = props.labelledBy;
}

if (props.describedBy) {
  editorAttributes["aria-describedby"] = props.describedBy;
}

// Announce upload success to screen readers
const onImageUploadComplete = (fileName: string) => {
  emit("image:uploaded", fileName);

  // TODO: move this code in a component wrapping this one
  const closest = browseInput.value?.closest(".fr-collapse");
  const message = closest?.querySelector("[data-image-success-message]");
  if (message) {
    // "external" is the file name in Firefox when using drag-and-drop
    // directly from an external website (with permissive CORS)
    message.textContent = fileName === "external" ?
      "L’image a été correctement insérée"
      : `L’image « ${fileName} » a été correctement insérée`;
    setTimeout(() => {
      message.textContent = "";
    }, 3000);
  }
};

const editor = useEditor({
  editorProps: {
    attributes: editorAttributes
  },
  editable: props.editable && !props.disabled,
  content: getContent(),
  extensions: getTiptapEditorExtensions({
    onImageUploadComplete: onImageUploadComplete
  }),
  onUpdate({ editor }) {
    // The content has changed.
    emit("update:modelValue", JSON.stringify(editor.getJSON()));
  }
}) as ShallowRef<Editor>;

const browseInput = useTemplateRef("browseInput");
function handleAddImageClick() {
  if (browseInput.value) {
    browseInput.value.value = "";
  }
  browseInput.value?.click();
}

function handleBrowseInputChange(e: Event) {
  const inputElement = e?.target as HTMLInputElement;
  const files = inputElement.files!;
  insertFilesAtSelection(editor.value, Array.from(files));
}

watch([() => props.editable, () => props.disabled], ([editable, disabled]) => {
  editor.value.setEditable(editable && !disabled);
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

defineExpose({
  focusEditor: () => {
    editor.value.commands.focus();
  }
});
</script>

<template>
  <div
    class="tiptap-container"
    :class="{
      'tiptap-container--not-editable': !editable,
      'tiptap-container--disabled': disabled
    }"
  >
    <ul v-if="editable" class="tiptap-buttons">
      <li>
        <ul>
          <li>
            <TiptapButton
              label="Mettre en gras"
              switch-off-label="Retirer le gras"
              icon="bold"
              :is-toggle="true"
              :disabled="!editor?.can().toggleBold() || disabled"
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
              :disabled="!editor?.can().toggleItalic() || disabled"
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
              :disabled="!editor?.can().toggleStrike() || disabled"
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
                !editor?.can().toggleHeading({ level: hLevel as Level }) ||
                  disabled
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
              :disabled="!editor?.can().setLink({ href: 'test' }) || disabled"
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
                (!editor?.can().toggleBulletList() &&
                  !editor?.can().toggleOrderedList()) ||
                  disabled
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
                (!editor?.can().toggleBulletList() &&
                  !editor?.can().toggleOrderedList()) ||
                  disabled
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
              :disabled="!editor?.can().toggleBlockquote() || disabled"
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
              :disabled="!editor?.can().toggleCode() || disabled"
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
              :disabled="!editor?.can().toggleCodeBlock() || disabled"
              :pressed="editor?.isActive('codeBlock')"
              @click="editor.chain().focus().toggleCodeBlock().run()"
            />
          </li>
          <li>
            <TiptapButton
              label="Insérer une image"
              icon="image-add-line"
              :label-visible="true"
              @click="handleAddImageClick"
            />
            <input
              ref="browseInput"
              type="file"
              class="fr-hidden"
              accept="image/*"
              hidden
              @change="handleBrowseInputChange"
            />
          </li>
        </ul>
      </li>
    </ul>

    <!-- Visually show the editor with a border and a label when CSS is disabled -->
    <p class="tiptap__fake-label" aria-hidden="true">
      Erreur et recommandation
    </p>
    <table
      role="presentation"
      border="1"
      width="100%"
      class="tiptap__fake-table"
    >
      <tr>
        <td>
          <EditorContent :editor="editor" />
        </td>
      </tr>
    </table>
  </div>
</template>

<style>
@import url("./tiptap.css");
@import url("./tiptap-hljs.css");

/* Handle case when CSS is disabled */
.tiptap__fake-label {
  display: none;
}

.tiptap__fake-table,
.tiptap__fake-table td {
  border: none;
}

/* Container */
.tiptap-container {
  --tiptap-editor-height: 16.5rem;

  position: relative;
  background-color: var(--background-alt-grey);
  border-radius: 0.5rem 0.5rem 0 0;
  border: 1px solid var(--border-plain-grey);
  border-bottom: 0;
  box-shadow: inset 0 -2px 0 0 var(--border-plain-grey);
}

/* Override bg color in dark mode to avoid same color as wrapper */
[data-fr-theme="dark"] .tiptap-container {
  background-color: var(--background-contrast-grey);
}

.tiptap-container--not-editable {
  padding: 0;
  background-color: transparent;
  border: none;
  box-shadow: none;
}

.tiptap-container--disabled:hover {
  cursor: not-allowed;
}

.tiptap-container--disabled .tiptap * {
  color: var(--text-disabled-grey);
}

.tiptap-selection,
.ProseMirror-selectednode {
  outline: var(--dsfr-outline) dotted 2px;
  max-width: max-content;
}

img.ProseMirror-widget {
  opacity: 0.3;
  color: color-mix(in srgb, currentcolor 0%, transparent);
}

.ProseMirror-gapcursor::after {
  border-top-color: var(--grey-0-1000) !important;
}

/* Buttons */
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
  background-color: inherit;
  top: 0;
  z-index: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

.titptap-buttons::-webkit-scrollbar {
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
  margin-left: 0.125rem;
}

.tiptap-buttons > li + li::before {
  box-shadow: inset 0 0 0 1px #dddddd;
  box-shadow: inset 0 0 0 1px var(--border-default-grey);
  content: "";
  display: inline-block;
  height: 1.5rem;
  margin-right: 0.125rem;
  position: relative;
  vertical-align: middle;
  width: 1px;
  z-index: -1;
}

.tiptap-buttons .fr-btn--tertiary {
  box-shadow: none;
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

/* Light mode button styles */
[data-fr-theme="light"] {
  .tiptap-buttons .fr-btn--tertiary {
    color: var(--text-mention-grey);

    &:hover {
      background-color: #e4e4e4;
    }

    &[aria-pressed="true"] {
      box-shadow: inset 0 -2px 0 0 var(--border-action-high-grey);
      color: var(--text-active-grey);
    }
  }
}

/* Dark mode button styles */
[data-fr-theme="dark"] {
  .tiptap-buttons .fr-btn--tertiary {
    color: var(--text-mention-grey);

    &:hover {
      background-color: #363636;
      color: var(--text-default-grey);
    }

    &[aria-pressed="true"] {
      box-shadow: inset 0 -2px 0 0 var(--border-action-high-grey);
      color: var(--text-active-grey);
    }
  }
}

.tiptap-buttons .fr-btn--icon-left[class*="fr-icon-image-add-line"] {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.tiptap-buttons .fr-btn--icon-left[class*="fr-icon-image-add-line"]::before {
  --icon-size: 1.5rem;
}

.fr-icon-strikethrough::before {
  mask-image: url("../../assets/images/strikethrough.svg");
}

.fr-icon-code-block::before {
  mask-image: url("../../assets/images/code-block.svg");
}
</style>
