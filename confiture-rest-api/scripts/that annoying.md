
# Rapport d'audit de l'application Centaure

## Pages considérées pour l'échantillon

Les pages suivantes ont été retenues :

- gestion des pouvoirs publics
- gestion des tables de transposition
- modification d'un pouvoir public
- détail d'une balance
- typologie des écritures
- gestion des balances
- création d'un pouvoir public
- accueil
- liste des balances d'une sous-entité
- gestion des écarts
- consultation de la table de transposition d'un pouvoir public 
- affichage des sous-entités d'un pouvoir public
- consultation des écritures chorus d'un pouvoir public


## Impression globale

Le niveau d'accessibilité est moyen.

Cependant, sous réserve des contraintes liées à Lombok, certaines non conformités peuvent être facilement corrigées, comme l'ajout de liens d'accès rapides, la modification de la hiérarchie des titres, la gestion des images ou encore les tableaux utilisés à des fins de présentation.

De plus, la correction des non conformités communes à la plupart des pages (les tableaux et formulaires, par exemple) permettrait d'améliorer grandement le niveau d'accessibilité de l'application.

## Principaux points relevés

Les éléments évoqués *infra* ne sont pas exhaustifs et visent uniquement à illustrer certaines non conformités rencontrées.

### Images

#### Images porteuses d'information

Certaines images porteuses d'information sont pourvues d'une alternative textuelle qui n'est pas pertinente.

Ainsi, le logo de l'application a l'alternative textuelle suivante : "logo de l'application CENTAURE" . Il conviendrait de la modifier en "Application Centaure".

En effet, l'alternative textuelle ne vise pas à décrire l'image mais à communiquer l'information portée par celle-ci.  

#### Images décoratives

Certaines images sont purement décoratives.

Par exemple, si vous placez une image de plante qui n'apporte aucune information, mais pour illustrer le sujet de l'écologie, il est inutile d'employer une alternative de type "Image de plante verte avec des fleurs roses aux larges pétales". Cette image n'apportant aucune information supplémentaire doit être masquée aux dispositifs d'assistance (comme les lecteurs d'écran).

En l'espèce, certaines images, comme l'icône affichée avant l'indication précisant que les champs comportant un astérisque sont obligatoires ou la flèche positionnée à côté du filtre) devraient être traitées de manière à être ignorées des lecteurs d'écran.

Ainsi, pour les images décoratives recourant à la balise \`img\`, il suffit de laisser l'attribut \`alt\` vide (\`alt=""\`).

### Couleurs

#### Informations données par la couleur uniquement

À voir en fonction de la réponse obtenue.

#### Contrastes des textes

Des éléments présentent des défauts de contraste, comme, par exemple, le texte rouge employé pour signaler certaines erreurs.

En effet, un contraste d'au moins 3 ou de 4,5 (selon la taille/graisse) du texte est requis.

Pour contrôler le contraste d'un élément, différents outils peuvent être employés :

- le [bookmarklet ANDI](https://www.ssa.gov/accessibility/andi/help/install.html)
- l'application [Colour Constrat Analyser](https://www.tpgi.com/color-contrast-checker/)
- la bibliothèque [Axe-Core](https://github.com/dequelabs/axe-core)

#### Contrastes des composants graphiques

Certaines icônes, à l'instar du crayon utilisé sur certaines pages pour symboliser une modification, n'offrent pas un contraste suffisant.

La correction la plus simple consiste à changer d'icône ou à lui adjoindre un liseré offrant un contraste suffisant (ex de l'icône représentant une loupe qui est dotée d'un liseré noir).

### Tableaux

La manière dont est conçue les tableaux n'est pas adéquate.

[La rubrique dédiée aux tableaux dans le guide de l'intégrateur RGAA ](https://disic.github.io/guide-integrateur/4-tableaux.html) comporte de précieux conseils.

#### Tableaux de présentation

Certains tableaux sont employés comme de tableaux de présentation mais ne sont pas identifiés comme tels (\`role="presentation"\`).

En tout état de cause, le mieux serait de ne pas employer de tableaux mais de recourir à une mise en forme par CSS à la place.

#### Tableaux de données

Les tableaux ne sont pas pourvus d'un titre et les entêtes ne sont pas identifiées à l'aide de l'attribut \`scope\` (ou d'un \`id\`).

[Voir la rubrique dédiée aux tableaux dans le guide de l'intégrateur RGAA ](https://disic.github.io/guide-integrateur/4-tableaux.html)

### Liens

Outre le fait que bon nombre de liens sont employés pour effectuer des actions qui relèveraient de boutons (voir *infra*), certains sont dépourvus d'un intitulé ou ont un intitulé non pertinent.

Ainsi, pour les liens comportant un attribut \`title\`, il convient de reprendre dans celui-ci l'intitulé visible du lien.

Exemple : 
\`\`\`<a href="https://[...]" title="Accéder à Centaure - nouvelle fenêtre">Accéder à Centaure</a>\`\`\`

### Scripts

#### Utilisation de boutons

Certains scripts sont actionnés à l'aide de liens au lieu de boutons (par exemple, les fonctions permettant de modifier la taille du texte). Or,  un lien suppose d'accéder à une ressource/page et ne doit pas servir de substitut aux boutons (exemple des liens permettant de modifier la taille du texte).

En outre,  les champs de soumission (\`<input type="submit">\`) ne devraient pas être employés à la place de liens (exemple de "Créer une écriture type" dans la page "Liste des écritures types").

#### Compatibilité avec les logiciels d'assistance

Certains composants comme les tableaux pouvant être triés ou les onglets, il convient de respecter les motifs de conception ARIA correspondants :

-  ["Sortable Table"](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/) pour les tableaux triables (en anglais))
- ["Tabs"](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) pour les onglets (en anglais) présents dans la page "Détail de la balance agrégée"

Enfin, les éléments qui  s'affichent au survol de la souris doivent aussi pouvoir s'afficher au clavier (à l'aide de la touche "Tab" notamment).

#### Messages de statut

Certains messages de statut ne sont pas signalés à l'aide du rôle adéquat :

- \`role="status"\`pour les messages d'information/confirmation
- \`role="alert"\` pour les messages d'erreur globaux

Ainsi, le message de chargement ("Requête en cours de traitement. Patientez ...") devrait être pourvu du rôle aria "status" et, plus globalement, être revu (il ne s'agit pas d'un lien, mais plutôt d'un paragraphe et l'image est décorative). 

### Éléments obligatoires

#### Validation du code

Si le critère exigeant que les pages présentent un code valide devrait disparaître dans une prochaine version du RGAA, il n'en demeure pas moins une exigence actuelle et, au demeurant, s'assurer de la validité du code demeure une bonne pratique.

Or, l'utilisation de l'outil de validation du W3C révèle des erreurs sur la plupart des pages (id dupliqués par exemple). 

#### Titres des pages/onglets

Le titre des pages n'est pas toujours pertinent, comme dans le cas des collections de pages présentes sur la page "Détail de la table de transposition"). Il devrait préciser la page considérée (ex: [...] Consulter la table de transposition du pouvoir public - Page 1 sur 3).

De même, lorsque des erreurs sont affichées à la suite de la soumission d'un formulaire, le titre de la page (balise \`title\`) devrait préciser le nombre d'erreurs (ex : Créer une sous-entité (2 erreurs) - Application Centaure ").

### Balises utilisées à des fins de présentation

Certaines balises sont utilisées uniquement à des fins de présentation, à l'instar de balises \`<label>\`qui ne sont pas employées pour désigner l'étiquette d'un champ de saisie (ex : le statut dans la page "Gestion des balances").

### Structuration de l'information

#### Structuration des pages

Les pages devraient comporter une structuration adéquate :
- balise \`header\`pour l'en-tête
- balise \`footer\` pour le pied de page
- balise \`main\` assortie du rôle ARIA adéquat  (\`main\`) pour le contenu principal
- balise \`nav\` pour le menu principal (qui devrait être assorti d'un aria-label "Menu principal" en outre) ou le fil d'Ariane.

#### Hiérarchie des titres

La hiérarchie des titres n'est pas toujours correcte (par exemple, certaines pages comportent un seul titre, mais de niveau 3, comme "Liste des pouvoirs publics").

Or, elle devrait obéir à la même logique de conception qu'un document dont on cherche à établir une table des matières adaptée.

### Structuration des listes

Certains éléments devraient être structurés à l'aide de listes, à l'instar des trois "liens-boutons" permettant de modifier la taille du texte qui devraient figurer dans une liste non ordonnée.

### Présentation de l'information

### Utilisation des feuilles de style CSS

La présentation devrait être assurée à l'aide de feuilles de style et non pas de certaines balises comme \`<center>\` ou \`<font>\`.

### Absence de défilement horizontal

Pour l'ensemble des pages, dès lors qu'elles sont consultées dans une dimension de type mobile (largeur de 320 pixels), un défilement horizontal s'applique.

Il conviendrait de revoir la conception des pages pour qu'elle soient adaptatives.

### Formulaires

#### Étiquettes 

Certains éléments de formulaire sont dépourvus d'étiquettes, à l'instar de certaines listes de sélection.

### Navigation

#### Systèmes de navigation

Le RGAA requiert la mise à disposition de deux des trois systèmes de navigation suivants :
- menu de navigation
- plan de site
- moteur de recherche.

Pour se conformer à cette exigence, il suffirait d'ajouter un plan de site pertinent.

Celui de sites comme Service Public.fr peut servir d'exemple.

#### Ordre de tabulation

Certaines pages comportent des rubriques assorties d'un attribut "tabindex" valorisé avec une valeur supérieure à zéro, ce qui conduit à un ordre de tabulation incohérent.

La correction consiste tout simplement à supprimer cet attribut.

### Consultation

#### Accessibilité des documents bureautiques en téléchargement

Le guide utilisateur mis à disposition au format PDF n'est pas complètement accessible. 

Il est possible de concevoir des PDF accessibles (la Direction interministérielle du numérique propose une formation sur ce sujet).

Toutefois, le plus simple serait de le proposer sous la forme d'une page web (elle-même accessible).

#### Temps de session

Actuellement, l'usager n'est pas informé de l'expiration de sa session.

Il conviendrait de proposer à l'usager, au moins 5 minutes avant l'expiration de sa session par exemple, de la prolonger d'une durée équivalente à la durée initiale de la session.

Cependant, ce sujet doit faire l'objet de travaux communs avec la DP7 (au titre des DAC).
 
## Ressources

Les guides mis à disposition par la DINUM du temps du RGAA 3 restent, globalement, d'actualité :

- [guide de l'intégrateur](https://disic.github.io/guide-integrateur/)
- [guide du développeur](https://disic.github.io/guide-developpeur/)
