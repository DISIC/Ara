<script lang="ts" setup>
import { ref, useId } from "vue";

import { REQUIRED, EMAIL, EQUAL } from "../../composables/validation";
import DsfrField from "../ui/DsfrField.vue";
import DsfrModal from "../ui/DsfrModal.vue";
import FieldValidation from "../validation/FieldValidation.vue";
import FormWithValidation from "../validation/form-with-validation/FormWithValidation.vue";

const uniqueId = useId();
const modal = ref<InstanceType<typeof DsfrModal>>();

defineProps<{
  procedureName: string;
  id: string;
}>();

const emit = defineEmits<{
  closed: [];
  confirm: [newEmail: string];
}>();

defineExpose({
  show: () => modal.value?.show(),
  hide: () => modal.value?.hide()
});

const email = ref("");
const confirmEmail = ref("");

const validationRules = [
  REQUIRED("Champ obligatoire. Saisissez l'adresse e-mail du destinataire."),
  EMAIL("Format incorrect. Utilisez le format : nom@domaine.fr")
];

function handleSubmit() {
  emit("confirm", email.value);
}

function handleClose() {
  modal.value?.hide();
}
</script>

<template>
  <DsfrModal
    :id="`transfer-modal-${id}`"
    ref="modal"
    :aria-labelledby="`transfer-modal-title-${id}`"
    @closed="$emit('closed')"
  >
    <FormWithValidation @submit="handleSubmit">
      <div class="fr-container fr-container--fluid fr-container-md">
        <div class="fr-grid-row fr-grid-row--center">
          <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
            <div class="fr-modal__body">
              <div class="fr-modal__header">
                <button
                  class="fr-btn--close fr-btn"
                  :aria-controls="`transfer-modal-${id}`"
                  type="button"
                >
                  Fermer
                </button>
              </div>
              <div class="fr-modal__content">
                <h1 :id="`transfer-modal-title-${id}`" class="fr-modal__title">
                  Transférer l’audit « {{ procedureName }} »
                </h1>
                <p>
                  Vous n’aurez plus accès à l’audit. Votre destinataire recevra par <span style="white-space: nowrap">e-mail</span> un lien d’accès à l’audit.
                </p>

                <FieldValidation
                  v-slot="{ error, focusRef }"
                  :value="email"
                  :validation="validationRules"
                >
                  <DsfrField :id="`email-${uniqueId}`" :ref="focusRef" v-model="email" type="email" :error="error" label="Adresse e-mail du destinataire" hint="Au format : nom@domaine.fr" />
                </FieldValidation>

                <FieldValidation
                  v-slot="{ error, focusRef }"
                  :value="confirmEmail"
                  :validation="[...validationRules, EQUAL(() => email, 'Saisie incorrecte. Les deux adresses e-mail doivent être identiques.')]"
                >
                  <DsfrField :id="`confirmEmail-${uniqueId}`" :ref="focusRef" v-model="confirmEmail" type="email" :error="error" label="Confirmer e-mail du destinataire" hint="Au format : nom@domaine.fr" />
                </FieldValidation>
              </div>
              <div class="fr-modal__footer">
                <ul
                  class="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg"
                >
                  <li>
                    <button
                      class="fr-btn fr-btn--secondary"
                      type="button"
                      @click="handleClose"
                    >
                      Annuler
                    </button>
                  </li>
                  <li>
                    <button class="fr-btn" type="submit">
                      Transférer l’audit
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormWithValidation>
  </DsfrModal>
</template>
