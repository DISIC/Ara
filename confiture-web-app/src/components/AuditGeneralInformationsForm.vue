<script lang="ts" setup>
import { nextTick, ref, computed } from "vue";
import { CreateAuditRequestData } from "../types";

const props = defineProps<{
  defaultValues?: CreateAuditRequestData;
}>();

const emit = defineEmits<{
  (e: "submit", payload: CreateAuditRequestData): void;
}>();

const availableTechnologies = ["HTML", "CSS", "JavaScript", "PHP", "MySQL"];

const procedureEntity = ref(props.defaultValues?.initiator ?? "");
const procedureName = ref(props.defaultValues?.procedureName ?? "");
const procedureSiteUrl = ref(props.defaultValues?.procedureUrl ?? "");
const procedureManagerName = ref(props.defaultValues?.contactName ?? "");
const procedureManagerEmail = ref(props.defaultValues?.contactEmail ?? "");
const procedureManagerFormUrl = ref(props.defaultValues?.contactFormUrl ?? "");
const procedureAuditorName = ref(props.defaultValues?.auditorName ?? "");
const procedureAuditorEmail = ref(props.defaultValues?.auditorEmail ?? "");
const defaultTechnologies = ref<string[]>([]);
const customTechnologies = ref<string[]>([""]);
const auditTechnologies = computed(() => {
  return [...defaultTechnologies.value, ...customTechnologies.value].filter(
    Boolean
  );
});

const customTechNameRefs = ref<HTMLInputElement[]>([]);

/**
 * Create a new tech and focus its field.
 */
async function addTech() {
  customTechnologies.value.push("");
  await nextTick();
  const lastInput =
    customTechNameRefs.value[customTechNameRefs.value.length - 1];
  lastInput.focus();
}

/**
 * Delete custom tech at index and focus previous or first field.
 * @param {number} i
 */
async function deleteCustomTech(i: number) {
  customTechnologies.value.splice(i, 1);
  await nextTick();
  const lastInput =
    i === 0 ? customTechNameRefs.value[0] : customTechNameRefs.value[i - 1];
  lastInput.focus();
}

/**
 * TODO: remove this
 * Dev function to avoid filling all fields manually
 */
function fillFields() {
  procedureEntity.value = "Mairie de Tours";
  procedureName.value = "Ma procédure";
  procedureSiteUrl.value = "https://example.com";
  procedureManagerName.value = "Philipinne Jolivet";
  procedureManagerEmail.value = "philipinne-jolivet@example.com";
  procedureManagerFormUrl.value = "https://example.com/contact";
  // procedureRecipients.value = [
  //   { name: "Isabelle", email: "isabelle@example.com" },
  //   { name: "Marc", email: "marc@example.com" },
  // ];
  procedureAuditorName.value = "Etienne Dupont";
  procedureAuditorEmail.value = "etienne-dupont@example.com";
  defaultTechnologies.value = ["HTML", "CSS"];
  customTechnologies.value = ["WordPress"];
}

function onSubmit() {
  emit("submit", {
    initiator: procedureEntity.value,
    procedureName: procedureName.value,
    procedureUrl: procedureSiteUrl.value,
    contactName: procedureManagerName.value,
    contactEmail: procedureManagerEmail.value,
    contactFormUrl: procedureManagerFormUrl.value,
    recipients: [],
    auditorName: procedureAuditorName.value,
    auditorEmail: procedureAuditorEmail.value,
    technologies: auditTechnologies.value,
  });
}
</script>

<template>
  <form class="content" @submit.prevent="onSubmit">
    <h1 class="fr-mb-3v">📄 Informations générales de la démarche à auditer</h1>
    <p class="fr-text--sm fr-mb-4w mandatory-notice">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <div class="fr-input-group">
      <label class="fr-label" for="procedure-entity">
        Entité qui demande l’audit
        <span class="fr-hint-text">
          Exemple : Ministère de l’intérieur, Mairie de Toulouse, etc
        </span>
      </label>
      <input
        id="procedure-entity"
        v-model="procedureEntity"
        class="fr-input"
        type="text"
        required
      />
    </div>

    <div class="fr-input-group">
      <label class="fr-label" for="procedure-name">
        Nom de l’audit
        <span class="fr-hint-text">
          Il peut s’agir du site ou du parcours que vous allez auditer
        </span>
      </label>
      <input
        id="procedure-name"
        v-model="procedureName"
        class="fr-input"
        type="text"
        required
      />
    </div>

    <div class="fr-input-group">
      <label class="fr-label" for="procedure-url">
        URL du site à auditer
        <span class="fr-hint-text">
          Saisissez une URL valide, commençant par http:// ou https://
        </span>
      </label>
      <input
        id="procedure-url"
        v-model="procedureSiteUrl"
        class="fr-input"
        type="text"
        required
        placeholder="https://"
      />
    </div>

    <fieldset class="fr-fieldset fr-mt-6w">
      <legend>
        <h2 class="fr-h4 fr-mb-2w">Responsable du site</h2>
      </legend>

      <p>
        Ces informations seront affichées dans la déclaration d’accessibilité.
        Elles permettent aux usagers qui rencontrent des difficultés pour
        accéder à du contenu ou à un service d’être orienté vers une solution
        adaptée. Au moins un des moyens de contact (adresse e-mail ou URL vers
        formulaire de contact) doit être rempli.
      </p>

      <div class="fr-input-group">
        <label class="fr-label" for="procedure-manager-name">
          Nom et prénom du contact (optionnel)
        </label>
        <input
          id="procedure-manager-name"
          v-model="procedureManagerName"
          class="fr-input"
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="procedure-manager-email">
          Adresse e-mail
          <span class="fr-hint-text">Exemple : contact@ministere.gouv.fr</span>
        </label>
        <input
          id="procedure-manager-email"
          v-model="procedureManagerEmail"
          class="fr-input"
          type="email"
          required
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="procedure-manager-form-url">
          URL vers formulaire de contact
          <span class="fr-hint-text">
            Saisissez une URL valide, commençant par http:// ou https://
          </span>
        </label>
        <input
          id="procedure-manager-form-url"
          v-model="procedureManagerFormUrl"
          class="fr-input"
          type="url"
          required
          placeholder="https://"
        />
      </div>
    </fieldset>

    <fieldset class="fr-fieldset fr-mt-6w fr-mb-4w">
      <legend>
        <h2 class="fr-h4 fr-mb-2w">Auditeur</h2>
      </legend>

      <p>
        Ces informations seront affichées sur le rapport d’audit, elles
        permettent à l’entité qui fait la demande d’audit de pouvoir contacter
        facilement l’auditeur en cas de questions.
      </p>

      <div class="fr-input-group">
        <label class="fr-label" for="procedure-auditor-name">
          Nom et prénom de l’auditeur (optionnel)
        </label>
        <input
          id="procedure-auditor-name"
          v-model="procedureAuditorName"
          class="fr-input"
        />
      </div>

      <div class="fr-input-group">
        <label class="fr-label" for="procedure-auditor-email">
          Adresse e-mail de l’auditeur
          <span class="fr-hint-text"
            >Exemple : prenom.nom@modernisation.gouv.fr</span
          >
        </label>
        <input
          id="procedure-auditor-email"
          v-model="procedureAuditorEmail"
          class="fr-input"
          type="email"
          required
        />
      </div>
    </fieldset>

    <fieldset class="fr-fieldset">
      <legend class="fr-fieldset__legend">
        <h2 class="fr-h4 fr-mb-0">
          Technologies utilisées pour la réalisation du site
        </h2>
      </legend>

      <div class="fr-fieldset__content">
        <div
          v-for="(tech, i) in availableTechnologies"
          :key="i"
          class="fr-checkbox-group"
        >
          <input
            :id="`tech-${i}`"
            v-model="defaultTechnologies"
            type="checkbox"
            :value="tech"
          />
          <label class="fr-label" :for="`tech-${i}`">
            {{ tech }}
          </label>
        </div>
      </div>
    </fieldset>

    <template v-for="(_, i) in customTechnologies" :key="i">
      <label class="fr-label fr-mb-1w fr-mt-4w" :for="`custom-tech-${i}`">
        Ajouter une technologie (optionnel)
      </label>
      <div class="delete-custom-tech">
        <input
          :id="`custom-tech-${i}`"
          ref="customTechNameRefs"
          v-model="customTechnologies[i]"
          class="fr-input"
          type="text"
        />
        <button
          class="fr-btn fr-btn--tertiary-no-outline fr-ml-3v"
          :disabled="customTechnologies.length === 1"
          type="button"
          @click="deleteCustomTech(i)"
        >
          Supprimer
        </button>
      </div>
    </template>

    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-mt-4w fr-mb-5w"
      type="button"
      @click="addTech"
    >
      Ajouter un outil
    </button>

    <div>
      <button
        class="fr-btn fr-mt-6w fr-mr-2w"
        type="button"
        @click="fillFields"
      >
        [DEV] Remplir les champs
      </button>
    </div>

    <button class="fr-btn fr-mt-6w" type="submit">Suivant</button>
  </form>
</template>

<style scoped>
.content {
  max-width: 49.5rem;
}

.mandatory-notice {
  color: var(--text-mention-grey);
}

.contact-card {
  border: 1px solid var(--border-default-grey);
}

.contact-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.delete-custom-tech {
  display: flex;
}
</style>
