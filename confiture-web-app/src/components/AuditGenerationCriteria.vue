<template>
  <div class="fr-tabs">
    <ul
      class="fr-tabs__list"
      role="tablist"
      aria-label="[A modifier | nom du système d'onglet]"
    >
      <li role="presentation">
        <button
          id="tabpanel-404"
          class="fr-tabs__tab"
          tabindex="0"
          role="tab"
          aria-selected="true"
          aria-controls="tabpanel-404-panel"
        >
          Accueil
        </button>
      </li>
      <li role="presentation">
        <button
          id="tabpanel-405"
          class="fr-tabs__tab"
          tabindex="-1"
          role="tab"
          aria-selected="false"
          aria-controls="tabpanel-405-panel"
        >
          Contact
        </button>
      </li>
      <li role="presentation">
        <button
          id="tabpanel-406"
          class="fr-tabs__tab"
          tabindex="-1"
          role="tab"
          aria-selected="false"
          aria-controls="tabpanel-406-panel"
        >
          FAQ
        </button>
      </li>
    </ul>
    <div
      id="tabpanel-404-panel"
      class="fr-tabs__panel fr-tabs__panel--selected"
      role="tabpanel"
      aria-labelledby="tabpanel-404"
      tabindex="0"
    >
      <!-- données de test -->
      <p>Contenu 1</p>
    </div>
    <div
      id="tabpanel-405-panel"
      class="fr-tabs__panel"
      role="tabpanel"
      aria-labelledby="tabpanel-405"
      tabindex="0"
    >
      <!-- données de test -->
      <p>Contenu 2</p>
    </div>
    <div
      id="tabpanel-406-panel"
      class="fr-tabs__panel"
      role="tabpanel"
      aria-labelledby="tabpanel-406"
      tabindex="0"
    >
      <!-- données de test -->
      <p>Contenu 3</p>
    </div>
  </div>
</template>
