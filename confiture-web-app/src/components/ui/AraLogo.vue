<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

import araLogoBlockDark from "../../assets/images/logo_ara-block-sombre.svg";
import araLogoBlockLight from "../../assets/images/logo_ara-block.svg";
import araLogoDark from "../../assets/images/logo_ara-sombre.svg";
import araLogoLight from "../../assets/images/logo_ara.svg";

import { useTheme } from "../../composables/useTheme";
import { useWindowWidth } from "../../composables/useWindowWidth";

interface Props {
  variant: "footer" | "header";
  withIntroduction?: boolean;
}

const {
  variant,
  withIntroduction
} = defineProps<Props>();

const theme = useTheme();
const windowWidth = useWindowWidth();

const araLogo = computed(() => {
  switch (variant) {
    case "footer":
      if (windowWidth.value < 768) return theme.value === "dark" ? araLogoBlockDark : araLogoBlockLight;
      return theme.value === "dark" ? araLogoDark : araLogoLight;
    case "header":
    default:
      return theme.value === "dark" ? araLogoDark : araLogoLight;
  }
});

const logoSize = computed(() => {
  switch (variant) {
    case "footer":
      return windowWidth.value < 768 ? { w: 198, h: 119 } : { w: 344, h: 104 };
    case "header":
    default:
      return windowWidth.value < 768 ? { w: 195, h: 44 } : { w: 268, h: 66 };
  }
});
</script>

<template>
  <div class="fr-enlarge-link">
    <RouterLink :to="{ name: 'home' }" title="Retour à l’accueil">
      <div :class="`ara-logo ara-logo--${variant}`">
        <img
          class="ara-logo__img"
          :src="araLogo"
          :width="logoSize.w"
          :height="logoSize.h"
          alt="Ara. Un outil Talan"
        />

        <p v-if="withIntroduction && windowWidth > 992" class="ara-logo-intro">
          <span class="ara-logo-intro__title">Ara vous oriente vers le bon chemin.</span>
          <span class="ara-logo-intro__subtitle">Audits et rapports d'accessibilité</span>
        </p>
      </div>
    </RouterLink>
  </div>
</template>

<style scoped>
.ara-logo {
  display: inline-flex;
  align-items: flex-end;
  gap: 16px;
}

.ara-logo-intro {
  display: flex;
  flex-direction: column;
  margin: 0;
}

.ara-logo-intro__title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary);
}

.ara-logo-intro__subtitle {
  font-size: 14px;
  line-height: 1;
  color: var(--color-muted);
}
</style>
