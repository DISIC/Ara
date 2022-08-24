<script lang="ts" setup>
import { /* nextTick, */ ref } from "vue";
import { CreateAuditRequestData } from "../types";

const props = defineProps<{
  defaultValues?: CreateAuditRequestData;
}>();

const emit = defineEmits<{
  (e: "submit", payload: CreateAuditRequestData): void;
}>();

const procedureEntity = ref(props.defaultValues?.initiator ?? "");
const procedureName = ref(props.defaultValues?.procedureName ?? "");
const procedureSiteUrl = ref(props.defaultValues?.procedureUrl ?? "");
const procedureManagerName = ref(props.defaultValues?.contactName ?? "");
const procedureManagerEmail = ref(props.defaultValues?.contactEmail ?? "");
const procedureManagerFormUrl = ref(props.defaultValues?.contactFormUrl ?? "");
// const procedureRecipients = ref(
//   props.defaultValues?.recipients ?? [
//     {
//       name: "",
//       email: "",
//     },
//   ]
// );
const procedureAuditorName = ref(props.defaultValues?.auditorName ?? "");
const procedureAuditorEmail = ref(props.defaultValues?.auditorEmail ?? "");

// const contactNameRefs = ref<HTMLInputElement[]>([]);

/**
 * Create a new contact and focus its name first
 */
// async function addContact() {
//   procedureRecipients.value.push({ name: "", email: "" });
//   await nextTick();
//   const lastInput = contactNameRefs.value[contactNameRefs.value.length - 1];
//   lastInput.focus();
// }

/**
 * Delete contact at index and focus previous or first name field.
 * @param {number} i
 */
// async function deleteContact(i: number) {
//   procedureRecipients.value.splice(i, 1);
//   await nextTick();
//   const previousInput =
//     i === 0 ? contactNameRefs.value[0] : contactNameRefs.value[i - 1];
//   previousInput.focus();
// }

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
  });
}
</script>

<template>
  <form class="content" @submit.prevent="onSubmit">
    <h1>📄 Informations générales de la démarche à auditer</h1>

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
          Nom et prénom du contact (optionnel)</label
        >
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

    <!-- <div class="fr-mt-4w">
      <h2 class="fr-h4 fr-mb-2w">Destinataires de l’audit</h2>

      <p>
        Il s’agit des personnes qui doivent être averties que l’audit est
        terminé et du taux d’accessibilité de la démarche. Il peut s’agir des
        porteurs de la démarche, référents accessibilité, chefs de projet,
        développeurs, etc. Ils seront les destinataires de la livraison de
        l’audit.
      </p>

      <fieldset
        v-for="(contact, i) in procedureRecipients"
        :key="i"
        class="fr-fieldset fr-mt-4w fr-p-4w contact-card"
      >
        <div class="fr-mb-2w contact-header">
          <legend>
            <h3 class="fr-text--lg fr-mb-0">Contact {{ i + 1 }}</h3>
          </legend>

          <button
            class="fr-link"
            type="button"
            :disabled="procedureRecipients.length === 1"
            @click="deleteContact(i)"
          >
            Supprimer
          </button>
        </div>

        <div class="fr-input-group">
          <label class="fr-label" :for="`procedure-auditor-name-${i + 1}`">
            Nom et prénom du contact
          </label>
          <input
            :id="`procedure-auditor-name-${i + 1}`"
            ref="contactNameRefs"
            v-model="contact.name"
            class="fr-input"
          />
        </div>

        <div class="fr-input-group">
          <label class="fr-label" :for="`procedure-auditor-email-${i + 1}`">
            Adresse e-mail du contact
            <span class="fr-hint-text">
              Exemple : prenom.nom@ministere.gouv.fr
            </span>
          </label>
          <input
            :id="`procedure-auditor-email-${i + 1}`"
            v-model="contact.email"
            class="fr-input"
            type="email"
            required
          />
        </div>
      </fieldset>

      <button
        class="fr-link fr-mt-4w fr-link--icon-left fr-icon-add-line"
        type="button"
        @click="addContact"
      >
        Ajouter contact
      </button>
    </div> -->

    <fieldset class="fr-fieldset fr-mt-6w">
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
          Nom et prénom de l’auditeur
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
</style>
