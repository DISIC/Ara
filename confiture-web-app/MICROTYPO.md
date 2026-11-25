# Microtypo

Voici les règles de [microtypographie](https://fr.wiktionary.org/wiki/microtypographie) utilisées sur Ara.

Sources&nbsp;:

- [La microtypographie au service de la lisibilité - JoliCode](https://jolicode.com/blog/la-microtypographie-au-service-de-la-lisibilite)
- [Espace fine insécable — Wikipédia](https://fr.wikipedia.org/wiki/Espace_fine_ins%C3%A9cable)
- [Espace insécable — Wikipédia](https://fr.wikipedia.org/wiki/Espace_ins%C3%A9cable)
- [microtypo.fr · Référentiel Typographique](https://microtypo.fr/)
- [Pour des espaces insécables impeccables | Antidote.info](https://www.antidote.info/fr/blogue/enquetes/pour-des-espaces-insecables-impeccables)

## Les espaces insécables

### Quand les utiliser&#8239;?

- **Espace insécable**
  - devant les caractères suivants&nbsp;:
    `:`, `%`, "—" (tiret M), "–" (tiret N)
  - à l’intérieur des paires de caractères suivantes&nbsp;:
    `« »`, `— —` (tirets M)

- **Espace insécable fine**
  - devant les caractères suivants&nbsp;:
    `!`, `?`, `;`, unité (`min`, `h`, `Ko`, `Mo`, etc.)

### Comment les utiliser dans le code&#8239;?

🚫 Ne pas utiliser le caractère «&nbsp;directement&nbsp;» car il ne sera pas
facilement identifiable dans le code.

✅ Utiliser le caractère HTML échappé

- dans les templates Vue.js
- dans les props correspondant à des slots
- dans le contenu des attributs `v-html`

✅ Utiliser le caractère Unicode

- dans les scripts JavaScript ou Typescript
- les props ou variables utilisées entre les `{{ }}` dans les templates
- dans le sujet (`subject`) des e-mails envoyés
  (entre les `{{ }}`)
- **Espace insécable**
  - HTML échappé&nbsp;: `&nbsp;`
  - Unicode&nbsp;: `\u00A0`

- **Espace insécable fine**
  - HTML échappé&nbsp;: `&#8239;`
  - Unicode&nbsp;: `\u202F`

## Les points de suspensions

- 🚫 Ne pas utiliser "..." (trois points)

- ✅ Utiliser "…" (caractère unique)
  - MacOS&nbsp;: `⌥ + .`
  - Windows&nbsp;: `alt + 0133`

## Les apostrophes

- 🚫 Ne pas utiliser l’apostrophe dactylographique `'` (touche 4) sauf pour marquer les unités de temps en anglais (2'30'')
- ✅ Utiliser l’apostrophe typographique `ʼ` («&nbsp;virgule haute&nbsp;»)
  - MacOS&nbsp;: `⌥ + '`
  - Windows&nbsp;: `alt + 0146`

  > L’accessibilité numérique

## Les guillemets

- 🚫 Ne pas utiliser les guillemets droits `" "`
- ✅ Utiliser les guillemets `« »` pour les citations

- ✅ Utiliser les guillemets `“ ”` anglais pour une citation à l’intérieur de guillemets français
  - MacOS&nbsp;: `⌥ + "` et `⌥ + ⇧ + "`
  - Windows&nbsp;: `alt + 0147` et `alt + 0148`

  > «&nbsp;Il m’a répondu “peut-être”.&nbsp;» (`«&nbsp;Il m’a répondu “peut-être”.&nbsp;»`)

## Les tirets

- ✅ Utiliser le trait d’union `-` dans les mots composés («&nbsp;_dash_&nbsp;» en anglais)
- ✅ Utiliser le «&nbsp;tiret M&nbsp;» `—` pour séparer une idée au sein d’une phrase («&nbsp;_em dash_&nbsp;» en anglais)
  - MacOS&nbsp;: `⌥ + -"`
  - Windows&nbsp;: `alt + 0151`

  > L’intelligence artificielle améliore parfois l’accessibilité –&nbsp;par exemple
  > en proposant une transcription automatique de séquence sonore&nbsp;— mais attention
  > à ne pas tomber dans le piège de la solution miracle&#8239;!<br>
  > (`[…] l’accessibilité –&nbsp;par exemple […] sonore&nbsp;— mais attention […]`)
  >
  > Elle permet aussi d’expliciter les points bloquants pour les rendre explicites
  > aux personnes concernées&nbsp;— en attendant qu’ils soient corrigés évidemment.<br>
  > (`[…] personnes concernées&nbsp;— en attendant […]`)

- ✅ Utiliser le «&nbsp;tiret N&nbsp;» `–` pour lier les nombres ou par exemple les mois d’un intervalle
  - MacOS&nbsp;: `⌥ + ⇧ + -"`
  - Windows&nbsp;: `alt + 0150` ou `Win + -`

  > 1–9, juin–août

  On pourra aussi l’utiliser avec une espace insécable avant et parfois après.

  > PDF&nbsp;–&nbsp;1,2&#8239;Mo (`PDF&nbsp;–&nbsp;1,2&#8239;Mo`)
  >
  > Contact&nbsp;– https://example.com/contact (`Contact&nbsp;– https://example.com/contact`)
  >
  > 20 mai&nbsp;– 18 juin (`20 mai&nbsp;– 18 juin`) ou mieux&nbsp;: du 20 mai au 18 juin)

- 💡 Note&nbsp;: Le signe moins `−` a lui aussi son propre signe (dans les équations)
  > 3&nbsp;×&nbsp;2&nbsp;−&nbsp;5&nbsp;=&nbsp;1 (`3&nbsp;×&nbsp;2&nbsp;−&nbsp;5&nbsp;=&nbsp;1`)
