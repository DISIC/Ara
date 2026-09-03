<script setup lang="ts">
import { computed } from "vue";
import { RouteLocationRaw, useRoute, useRouter } from "vue-router";

import { getRouteLabel } from "../../utils";

interface BreadcrumbItem {
  label: string;
  to: RouteLocationRaw;
}

// Safety net against a cycle in the `meta.parent` chain
const MAX_DEPTH = 10;

const route = useRoute();
const router = useRouter();

function getParentName(parent: string | (() => string | null) | undefined) {
  return (typeof parent === "function" ? parent() : parent) ?? null;
}

/**
 * Params of the current route which are also part of the given route path
 * (`uniqueId` for audit pages). The other ones are left out, otherwise the
 * router warns about "discarded invalid params".
 */
function getSharedParams(routeName: string) {
  const record = router.getRoutes().find((r) => r.name === routeName);
  const paramNames = [...(record?.path ?? "").matchAll(/:(\w+)/g)].map(
    (match) => match[1]
  );

  return Object.fromEntries(
    paramNames
      .filter((paramName) => paramName in route.params)
      .map((paramName) => [paramName, route.params[paramName]])
  );
}

/**
 * Ancestors of the current page, from the root down to its direct parent.
 * Empty when the current route has no `meta.parent`, which hides the breadcrumb.
 */
const ancestors = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [];
  let parentName = getParentName(route.meta.parent);

  while (parentName && items.length < MAX_DEPTH) {
    const to = { name: parentName, params: getSharedParams(parentName) };

    let parent;
    try {
      parent = router.resolve(to);
    } catch {
      // Unknown route or missing param: stop here rather than break the page
      break;
    }

    items.unshift({ label: getRouteLabel(parent), to });
    parentName = getParentName(parent.meta.parent);
  }

  return items;
});

const currentLabel = computed(() => getRouteLabel(route));
</script>

<template>
  <nav
    v-if="ancestors.length"
    class="fr-breadcrumb"
    role="navigation"
    aria-label="vous êtes ici :"
  >
    <button
      class="fr-breadcrumb__button"
      aria-expanded="false"
      aria-controls="breadcrumb"
    >
      Voir le fil d’Ariane
    </button>
    <div id="breadcrumb" class="fr-collapse">
      <ol class="fr-breadcrumb__list">
        <li v-for="ancestor in ancestors" :key="ancestor.label">
          <RouterLink class="fr-breadcrumb__link" :to="ancestor.to">
            {{ ancestor.label }}
          </RouterLink>
        </li>
        <li>
          <a class="fr-breadcrumb__link" aria-current="page">
            {{ currentLabel }}
          </a>
        </li>
      </ol>
    </div>
  </nav>
</template>
