<script lang="ts" setup>
import { type Level } from "@tiptap/extension-heading";
import { Editor, EditorContent, useEditor } from "@tiptap/vue-3";
import { onBeforeUnmount, ShallowRef, watch } from "vue";

import { useUniqueId } from "../../composables/useUniqueId";
import { displayedHeadings, tiptapExtensions } from "./tiptap-extensions";
import TiptapButton from "./TiptapButton.vue";

export interface Props {
  modelValue?: string | null;
  editable?: boolean;
  labelledBy?: string | null;
  disabled?: boolean;
  editorSize?: "sm" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  editable: true,
  disabled: false,
  labelledBy: null,
  editorSize: "sm"
});

const emit = defineEmits(["update:modelValue"]);

const uniqueId = useUniqueId();

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
      "aria-describedby": "tiptap-description",
      "aria-multiline": "true",
      role: "textbox",
      class: `tiptap--${props.editorSize}`
    }
  : {
      class: "tiptap--not-editable"
    };

if (props.labelledBy) {
  editorAttributes["aria-labelledby"] = props.labelledBy;
}

const editor = useEditor({
  editorProps: {
    attributes: editorAttributes
  },
  editable: props.editable && !props.disabled,
  content: getContent(),
  extensions: tiptapExtensions,
  onUpdate({ editor }) {
    // The content has changed.
    emit("update:modelValue", JSON.stringify(editor.getJSON()));
  }
}) as ShallowRef<Editor>;

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
    <p
      v-if="editable"
      :id="`tiptap-description-${uniqueId}`"
      class="fr-sr-only"
    >
      Éditeur de texte riche
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
        </ul>
      </li>
    </ul>
    <editor-content :editor="editor" />
  </div>
</template>

<style>
@import url("./tiptap.css");

/* Container */
.tiptap-container {
  position: relative;
  background-color: var(--background-alt-grey);
  border-radius: 0.5rem 0.5rem 0 0;
  border: 1px solid var(--border-plain-grey);
  border-bottom: 0;
  box-shadow: inset 0 -2px 0 0 var(--border-plain-grey);

  /* Override bg color in dark mode to avoid same color as wrapper */
  @media (prefers-color-scheme: dark) {
    background-color: var(--background-contrast-grey);
  }
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
  outline-style: dotted;
  outline-width: 2px;
  outline-color: var(--dsfr-outline);
}

.ProseMirror-widget {
  opacity: 0.5;
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
  box-shadow: inset 0 0 0 1px #ddd;
  box-shadow: inset 0 0 0 1px var(--border-default-grey);
  content: "";
  display: inline-block;
  height: 1.5rem;
  margin-right: 0.125rem;
  position: relative;
  vertical-align: middle;
  width: 1px;
}

.tiptap-buttons .fr-btn--tertiary {
  color: var(--text-mention-grey);
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

.tiptap-buttons .fr-btn--tertiary[aria-pressed="true"] {
  background-color: var(--background-alt-grey-active);
}

.tiptap-buttons .fr-btn--tertiary[aria-pressed="true"]:hover {
  background-color: var(--background-alt-grey-hover);
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
