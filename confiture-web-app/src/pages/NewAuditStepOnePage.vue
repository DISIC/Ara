<script lang="ts" setup>
import { ref, nextTick } from "vue";
import router from "../router";
import { createAudit } from "../api/createAudit";

import LeaveModal from "../components/LeaveModal.vue";

const procedureEntity = ref("");
const procedureName = ref("");
const procedureSiteUrl = ref("");
const procedureManagerName = ref("");
const procedureManagerEmail = ref("");
const procedureManagerFormUrl = ref("");
const procedureRecipients = ref([
  {
    name: "",
    email: "",
  },
]);
const procedureAuditorName = ref("");
const procedureAuditorEmail = ref("");

const isLeaveModalOpen = ref(false);

const contactNameRefs = ref<HTMLInputElement[]>([]);

/**
 * Create a new contact and focus its name first
 */
async function addContact() {
  procedureRecipients.value.push({ name: "", email: "" });
  await nextTick();
  const lastInput = contactNameRefs.value[contactNameRefs.value.length - 1];
  lastInput.focus();
}

/**
 * Delete contact at index and focus previous or first name field.
 * @param {number} i
 */
async function deleteContact(i: number) {
  procedureRecipients.value.splice(i, 1);
  await nextTick();
  const previousInput =
    i === 0 ? contactNameRefs.value[0] : contactNameRefs.value[i - 1];
  previousInput.focus();
}

async function showLeaveModal() {
  isLeaveModalOpen.value = true;
}

async function confirmLeave() {
  router.push({ name: "home" });
}

function submitStepOne() {
  createAudit({
    initiator: procedureEntity.value,
    procedure: procedureName.value,
    procedureUrl: procedureSiteUrl.value,
    contactName: procedureManagerName.value,
    contactEmail: procedureManagerEmail.value,
    contactFormUrl: procedureManagerFormUrl.value,
    recipients: procedureRecipients.value,
    auditorName: procedureAuditorName.value,
    auditorEmail: procedureAuditorEmail.value,
  }).then((audit) => {
    // TODO: replace current history entry with the edit page
    router.push({
      name: "edit-audit-step-two",
      params: { uniqueId: audit.editUniqueId },
    });
  });
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
  procedureRecipients.value = [
    { name: "Isabelle", email: "isabelle@example.com" },
    { name: "Marc", email: "marc@example.com" },
  ];
  procedureAuditorName.value = "Etienne Dupont";
  procedureAuditorEmail.value = "etienne-dupont@example.com";
}
</script>

<template>
  <div class="fr-stepper">
    <h2 class="fr-stepper__title">
      <span class="fr-stepper__state">Étape 1 sur 2</span>
      Informations générales
    </h2>
    <div
      class="fr-stepper__steps"
      data-fr-current-step="1"
      data-fr-steps="2"
    ></div>
    <p class="fr-stepper__details">
      <span class="fr-text--bold">Étape suivante :</span> Paramètres de l’audit
    </p>
  </div>
  <form class="content" @submit.prevent="submitStepOne">
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
      <label class="fr-label" for="procedure-url">URL du site à auditer</label>
      <input
        id="procedure-url"
        v-model="procedureSiteUrl"
        class="fr-input"
        type="text"
        required
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
        </label>
        <input
          id="procedure-manager-form-url"
          v-model="procedureManagerFormUrl"
          class="fr-input"
          type="url"
          required
        />
      </div>
    </fieldset>

    <div class="fr-mt-4w">
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
    </div>

    <fieldset class="fr-fieldset fr-mt-6w">
      <legend>
        <h2 class="fr-h4 fr-mb-2w">Auditeur</h2>
      </legend>

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
      <button
        class="fr-btn fr-mt-6w fr-mb-1w"
        type="button"
        :data-fr-opened="isLeaveModalOpen"
        aria-controls="leave-modal"
        @click="showLeaveModal"
      >
        [DEV] Afficher la modale
      </button>
    </div>

    <button class="fr-btn fr-mt-6w" type="submit">Suivant</button>
  </form>

  <LeaveModal
    v-if="isLeaveModalOpen"
    title="Vous allez quitter l’audit"
    confirm="Oui, quitter l’audit"
    cancel="Non, poursuivre l’audit"
    @confirm="confirmLeave"
  >
    <p>
      A ce stade aucune des informations saisies ne sera sauvegardées. C’est à
      partir de l’étape 2 que vous pourrez quitter votre audit et y revenir sans
      perdre vos informations.
    </p>
    <p>Souhaitez-vous quitter l’audit ?</p>
  </LeaveModal>
</template>

<style scoped>
.content {
  max-width: 792px;
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
