<script lang="ts" setup>
import { ref } from "vue";

import Tiptap from "../components/ui/Tiptap.vue";

const content = ref(
  '{"type":"doc","content":[{"type":"codeBlock","attrs":{"language":"html"},"content":[{"type":"text","text":"<button class=\\"fr-btn--sm fr-btn--tertiary fr-icon-h-1 fr-btn--is-toggle\\" aria-pressed=\\"false\\" title=\\"Passer en titre de niveau 1\\">Passer en titre de niveau 1</button>"}]},{"type":"paragraph","content":[{"type":"text","text":"qslkdfjqlsfjk"}]},{"type":"codeBlock","attrs":{"language":"javascript"},"content":[{"type":"text","text":"console.log(\\"Hello world\\");"}]},{"type":"paragraph","content":[{"type":"text","text":"lkqfjs"}]},{"type":"codeBlock","attrs":{"language":"css"},"content":[{"type":"text","text":"html {\\n  font-size: 2rem;\\n}"}]}]}'
);
</script>

<template>
  <h1>Éditeur tiptap</h1>

  <div class="fr-input-group fr-mb-1v">
    <p id="tiptap-editor" class="fr-label">Laissez aller votre imagination</p>
    <Tiptap v-model="content" editable labelled-by="tiptap-editor" />
  </div>
</template>
