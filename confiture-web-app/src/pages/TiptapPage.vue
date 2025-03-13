<script lang="ts" setup>
import { ref } from "vue";

import Tiptap from "../components/ui/Tiptap.vue";
const content = ref(
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello "},{"type":"text","marks":[{"type":"bold"}],"text":"world"},{"type":"text","text":". Ceci est du "},{"type":"text","marks":[{"type":"strike"}],"text":"texte barré"},{"type":"text","text":" et ça du "},{"type":"text","marks":[{"type":"italic"}],"text":"texte en italique"},{"type":"text","text":" et enfin, du "},{"type":"text","marks":[{"type":"code"}],"text":"code inline"},{"type":"text","text":"."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Le code de cet éditeur"}]},{"type":"codeBlock","attrs":{"language":"html"},"content":[{"type":"text","text":"<button class=\\"fr-btn--sm fr-btn--tertiary fr-icon-h-1 fr-btn--is-toggle\\" aria-pressed=\\"false\\" title=\\"Passer en titre de niveau 1\\">Passer en titre de niveau 1</button>"}]},{"type":"paragraph","content":[{"type":"text","text":"La documentation est dispo ici : "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","target":"_blank","rel":"noopener noreferrer nofollow","class":null,"title":null}}],"text":"lien de la doc"},{"type":"text","text":"."}]},{"type":"codeBlock","attrs":{"language":"javascript"},"content":[{"type":"text","text":"console.log(\\"Hello world\\");"}]},{"type":"paragraph","content":[{"type":"text","text":"Un exemple de liste :"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Un"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Deux"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Trois"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"On recommence ?"}]}]}]},{"type":"codeBlock","attrs":{"language":"css"},"content":[{"type":"text","text":"html {\\n  font-size: 2rem;\\n}"}]},{"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"covfefe"}]}]}]}'
);
</script>

<template>
  <h1>Éditeur tiptap</h1>

  <div class="fr-input-group fr-mb-1v">
    <p id="tiptap-editor" class="fr-label">Laissez aller votre imagination</p>
    <Tiptap v-model="content" editable labelled-by="tiptap-editor" />
  </div>
</template>
