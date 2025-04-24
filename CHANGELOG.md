<h1 class="fr-mb-4w">Notes de version</h1>

<p class="fr-text--lg fr-mb-5w">Cette page vous permet de suivre l’évolution du produit de manière transparente et continue.Tous les changements importants d'Ara sont listés ici, avec leur date, leur type (correction, nouvelle fonctionnalité, autres changements) et le lien vers la PR correspondante.</p>

<h2 class="fr-sr-only" id="2025">2025</h2>

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">23/04/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Supprime les liens non-explicites pour accéder à la déclaration et au rapport d’audit sur la synthèse ([#1044](https://github.com/DISIC/Ara/pull/1044))
- Ajoute des mentions sur les champs optionnels de la déclaration d’accessibilité et des paramètres de l’audit ([#1054](https://github.com/DISIC/Ara/pull/1054))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">22/04/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute un éditeur riche pour les commentaires de critères et les notes d'audit ([#1018](https://github.com/DISIC/Ara/pull/1018))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">14/04/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Plusieurs améliorations sur la navigation entre les différents onglets pendant l’audit et dans le rapport ([#950](https://github.com/DISIC/Ara/pull/950)) :
  - Les panneaux d’onglet sont désormais considérés comme des pages qui ont leur adresse (URL) propre et sont ajoutées dans l’historique de navigation ;
  - lorsque l’on accède à un onglet, la page défile pour placer les onglets en haut de l’écran ;
  - l’onglet actif reste toujours visible, même sur petit écran et avec une navigation au clavier.
- Corrige la mauvaise position verticale dans la page après utilisation des ancres « Pages » du rapport
- Correction du contraste des cartes de types d’audit ([#1056](https://github.com/DISIC/Ara/pull/1056))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">09/04/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige le calcul du nombre de critères non applicables par page dans le rapport ([#1039](https://github.com/DISIC/Ara/pull/1039))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Permet la fermeture du bandeau de retour utilisateur ([#1042](https://github.com/DISIC/Ara/pull/1042))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">03/04/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l’affichage du contenu des infobulles lorsque le CSS est désactivé ([#1025](https://github.com/DISIC/Ara/pull/1025))
- Ajoute des bordures aux champs de saisie pour améliorer leur accessibilité ([#1038](https://github.com/DISIC/Ara/pull/1038))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">26/03/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige les accordéons qui fermaient les accordéons parents lorsqu’on souhaitait les fermer ([#1017](https://github.com/DISIC/Ara/pull/1017))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">20/03/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l’affichage sans CSS du composant pour l’ajout de technologies, d’outils d’assistance ou d’éléments transverses ([#1014](https://github.com/DISIC/Ara/pull/1014))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">19/03/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Ajoute un titre manquant sur l’onglet des notes sur le rapport ([#1002](https://github.com/DISIC/Ara/pull/1002))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">12/03/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute une liste éditable des éléments audités dans l'onglet transverse ([#964](https://github.com/DISIC/Ara/pull/964))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Revoit la navigation entre les pages de l’audit ([#937](https://github.com/DISIC/Ara/pull/937))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige la hiérarchie des titres dans les onglets du rapport ([#975](https://github.com/DISIC/Ara/pull/975))
- Ajoute un attribut `lang="en"` aux noms d’outils, de navigateurs et de technologies d’assistance dans la déclaration d’accessibilité ([#974](https://github.com/DISIC/Ara/pull/974))
- Cache de manière accessible l’emoji de la bannière de bienvenue ([#973](https://github.com/DISIC/Ara/pull/973))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">05/03/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute les cas particuliers et les notes techniques aux critères de l’audit ([#947](https://github.com/DISIC/Ara/pull/947))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Amélioration de la visibilité des ancres dans la barre latérale de l’audit ([#957](https://github.com/DISIC/Ara/pull/957))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">07/02/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute une aide et des exemples sur l’impact usager ([#928](https://github.com/DISIC/Ara/pull/928))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">06/02/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige la hiérarchie des titres et les annonces d’enregistrement pour les technologies d’assistance ([#933](https://github.com/DISIC/Ara/pull/933))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">05/02/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Améliore l’affichage des erreurs et points d’amélioration dans le rapport ([#929](https://github.com/DISIC/Ara/pull/929))
- Explicite l'ouverture des livrables dans un nouvel onglet ([#932](https://github.com/DISIC/Ara/pull/932))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">22/01/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Affiche le taux de progression de l’audit sur la page "Mes audits" ([#914](https://github.com/DISIC/Ara/pull/914))
- Ne demande pas son adresse email à un utilisateur déjà connecté lors de la réinitialisation de mot de passe ([#926](https://github.com/DISIC/Ara/pull/926))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">16/01/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Supprime la page "Contexte" ([#924](https://github.com/DISIC/Ara/pull/924))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">10/01/2025</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Mise à jour du DSFR en version `1.13.0` ([#915](https://github.com/DISIC/Ara/pull/915))

<h2 class="fr-sr-only" id="2024">2024</h2>

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">18/12/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige les menus déroulants en rendant le code HTML généré valide ([#881](https://github.com/DISIC/Ara/pull/881))
- Corrige la mauvaise position verticale dans la page après utilisation des ancres « Pages » du rapport ([#879](https://github.com/DISIC/Ara/pull/879))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">13/12/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige la position des infobulle "Non-applicable" sur la liste des audits ([#904](https://github.com/DISIC/Ara/pull/904))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">12/12/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige le formulaire de retour après avoir supprimé le compte ([#907](https://github.com/DISIC/Ara/pull/907))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">11/12/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajoute un lien de retour sur la page de création d’audit ([#902](https://github.com/DISIC/Ara/pull/902))
- Ajoute un lien vers les paramètres de l’audit dans la synthèse et la liste des audits ([#900](https://github.com/DISIC/Ara/pull/900))
- Ajuste le contenu de l’email de création d’audit ([#901](https://github.com/DISIC/Ara/pull/901))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige le lien et l’icône des audits "non commencés" dans la liste des audits du compte ([#886](https://github.com/DISIC/Ara/pull/886))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">06/12/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige la possibilité de supprimer une image liée à un critère d’élément transverse ([#898](https://github.com/DISIC/Ara/pull/898))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">27/11/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Affiche seulement les pages avec des commentaires C ou NA dans l’onglet du rapport "Points d’amélioration" ([#884](https://github.com/DISIC/Ara/pull/884))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l’ordre des pages dans le tableau de répartition des critères par page dans le rapport ([#885](https://github.com/DISIC/Ara/pull/885))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">22/11/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Change le texte du bouton principal des audits à 0% dans la liste des audits de "Continuer l’audit" à "Commencer l’audit" ([#843](https://github.com/DISIC/Ara/pull/843))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige le problème des filtres des critères qui décalait l’ordre des pages de l’échantillon sur la page d’audit ([#877](https://github.com/DISIC/Ara/pull/877))
- Corrige la "fausse" mise à jour des paramètres de l’audit quand on quitte la page sans sauvegarder ([#875](https://github.com/DISIC/Ara/pull/875))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">21/11/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige un mauvais calcul d’arrondi sur la complétion des thématiques de l’audit ([#882](https://github.com/DISIC/Ara/pull/882))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">20/11/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige un problème de vocalisation de lecteur d’écran sur la page du tableau de bord ([#883](https://github.com/DISIC/Ara/pull/883))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">15/11/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige un bug lié à l'ancienne gestion des critères transverses provoquant parfois des écrasenements de données ([#876](https://github.com/DISIC/Ara/pull/876))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">07/11/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Affiche le bon statut des audits dans la liste des audits du compte en fonction de leur complétion ([#822](https://github.com/DISIC/Ara/pull/822))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">06/11/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Affiche le commentaire correspondant au statut du critère (C ou NA) dans le rapport d’audit ([#844](https://github.com/DISIC/Ara/pull/844))
- Ordonne correctement les pages dans la déclaration d’accessibilité et le contexte de l’audit ([#819](https://github.com/DISIC/Ara/pull/819))
- Ordonne les audits du tableau de bord par date de création descendante (du plus récent au plus ancien) ([#821](https://github.com/DISIC/Ara/pull/821))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">31/10/2024</h3>

- Corrige un bug rendant impossible la duplication d'un audit contenant des images d'exemple pour des critères transverses ([#836](https://github.com/DISIC/Ara/pull/836))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">18/10/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajout de liens de recours dans la déclaration d’accessibilité générée ([#812](https://github.com/DISIC/Ara/pull/812))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">17/10/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Modifie la gestion des éléments transverses : l’interrupteur "Sur toutes les pages" est remplacé par l’onglet "Éléments transverses" qui permet d’évaluer les éléments communs à toutes les pages : en-tête, pied de page... ([#758](https://github.com/DISIC/Ara/pull/758))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">09/10/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige la mise à jour de l’ordre des pages quand les 2 pages ne sont pas adjacentes ([#809](https://github.com/DISIC/Ara/pull/809))
- Corrige l’application de l'attribut `autocomplete` sur le champ "email" du formulaire de connexion ([#808](https://github.com/DISIC/Ara/pull/808))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">05/09/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute une modale de confirmation lors de la suppression d’une pièce jointe sur un critère "Non conforme" ([#788](https://github.com/DISIC/Ara/pull/788))
- Met automatiquement le focus sur le champs "Erreur et recommandation" lorsque qu’un critère est défini comme "Non conforme" ([#766](https://github.com/DISIC/Ara/pull/766))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">24/07/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajoute une information pour préciser la nature des contenus dans l’onglet "Points d’améliorations" ([#764](https://github.com/DISIC/Ara/pull/764))
- Simplifie l’ajout d’environnements de test personnalisés ([#765](https://github.com/DISIC/Ara/pull/765))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">11/07/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Le lien d’ancre "Haut de page" entre les thématiques de l’audit renvoie vers désormais vers le haut des onglets plutôt que l’en-tête du site ([#750](https://github.com/DISIC/Ara/pull/750))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">10/07/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l’onglet des notes qui n’était pas affiché lorsque l’audit avait des pièces jointes mais pas de notes textuelles ([#753](https://github.com/DISIC/Ara/pull/753))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">03/07/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute les critères conformes et non applicables au rapport dans l’onglet "Points d’améliorations" ([#732](https://github.com/DISIC/Ara/pull/732))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Correction des filtres de critères qui ne fonctionnaient pas correctement dans certains cas ([#737](https://github.com/DISIC/Ara/pull/737))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">26/06/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute la possibilité de télécharger (téléverser) des fichiers – « pièces jointes » – au niveau des annotations de l’audit ([#669](https://github.com/DISIC/Ara/pull/669)) :
  - Agrandissement de la zone d’annotation en panneau latéral
  - Sauvegarde automatique des changements
  - Création d’un composant d’ajout de fichier commun (critères non conformes + annotations)
  - Choix de _télécharger_ ou de _visualiser_ chaque fichier
  - Affichage des pièces jointes dans les notes du rapport d’audit
  - Suppression des bannières de notification d’ajout et de suppression de fichier
  - Affichage de la syntaxe Markdown dans une page séparée (au lieu d’une modale)

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">12/06/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Fusionne les champs "Recommandation" et "Description de l'erreur" ([#720](https://github.com/DISIC/Ara/pull/720))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">06/06/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige un problème du filtre de conformité des critères ([#726](https://github.com/DISIC/Ara/pull/726))
- Corrige la validation des champs URL pour être plus flexible ([#727](https://github.com/DISIC/Ara/pull/727))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">05/06/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Permet d’accéder au rapport depuis la déclaration et vice-versa ([#725](https://github.com/DISIC/Ara/pull/725))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">31/05/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Séquence le paramétrage d’un audit en plusieurs étapes ([#702](https://github.com/DISIC/Ara/pull/702))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">24/05/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige des `id` dupliqués dans les modales de duplication et de suppression d’audit ([#712](https://github.com/DISIC/Ara/pull/712))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">23/05/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Permet d’accéder à un rapport quand l’audit est supprimé ([#662](https://github.com/DISIC/Ara/pull/662))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l’URL copiée de la déclaration d’accessibilité ([#713](https://github.com/DISIC/Ara/pull/713))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">26/04/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajoute un lien de retour vers le rapport depuis la page de contexte de l’audit ([#703](https://github.com/DISIC/Ara/pull/703))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">17/04/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Détache la déclaration d’accessibilité du rapport d’accessibilité ([#696](https://github.com/DISIC/Ara/pull/696))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige le problème d’ordre des pages sur le rapport ([#692](https://github.com/DISIC/Ara/pull/692))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">10/04/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Améliore la navigation entre les différents espaces du site : audit, compte utilisateur et livrables ([#683](https://github.com/DISIC/Ara/pull/683))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">05/04/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute la possibilité de filtrer les critères par statut "Non testé" lors de la réalisation de l’audit ([#693](https://github.com/DISIC/Ara/pull/693))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">07/03/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Améliorer l’affichage sur mobile du header sticky sur la page de génération de l’audit ([#678](https://github.com/DISIC/Ara/pull/678))
- Corrige l’affichage des donuts des statistiques parfois désactivés ([#676](https://github.com/DISIC/Ara/pull/676))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Supprime la rubrique des ressources ([#675](https://github.com/DISIC/Ara/pull/675))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">22/02/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajoute des liens d’accès dans le menu déroulant d’un audit sur la page "Mes audits" ([#658](https://github.com/DISIC/Ara/pull/658))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l’affichage du taux de conformité dans les cartes des donuts et harmonise les cartes entre l’audit et le rapport ([#661](https://github.com/DISIC/Ara/pull/661))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">16/02/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l’affichage du bandeau "Audit en cours" qui parfois n’était pas visible ([#659](https://github.com/DISIC/Ara/pull/659))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">31/01/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Empêche la création de pages avec des espaces dans l’URL ([#623](https://github.com/DISIC/Ara/pull/623))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Corrige l’accessibilité de l’indicateur d’étape terminée sur la synthèse d’un audit ([#630](https://github.com/DISIC/Ara/pull/630))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">25/01/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute la possibilité de changer l’ordre des pages de l’échantillon depuis les paramètres de l’audit ([#613](https://github.com/DISIC/Ara/pull/613))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige la navigation au clavier des onglets des pages de l’audit ([#625](https://github.com/DISIC/Ara/pull/625))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">18/01/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Améliorer l’accessibilité et la compréhension de l’onglet du détail des résultats ([#606](https://github.com/DISIC/Ara/pull/606))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l’affichage des blocs de page de la page de paramètres sur Safari ([#608](https://github.com/DISIC/Ara/pull/608))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">16/01/2024</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Informe mieux l’usager sur les différents types d’audits lors du paramétrage d’un audit ([#604](https://github.com/DISIC/Ara/pull/604))

<h2 class="fr-sr-only" id="2023">2023</h2>

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">14/12/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’une page synthèse pour faciliter l’accès aux documents liés à l’audit ([#579](https://github.com/DISIC/Ara/pull/579))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Déplacement des notes dans l’en-tête de la page de génération de l’audit ([#579](https://github.com/DISIC/Ara/pull/579))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">11/12/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige un bug qui empêchait l’ouverture des modales ([#583](https://github.com/DISIC/Ara/pull/583))
- Corrige le message d’erreur lors de la duplication d’un audit depuis la page de l’audit ([#584](https://github.com/DISIC/Ara/pull/584))
- Corrige l’affichage des interrupteurs suite à la mise à jour du DSFR ([#586](https://github.com/DISIC/Ara/pull/586))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">08/12/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Les onglets de page sur la page d'audit sont maintenant collés au haut de l'écran ([#541](https://github.com/DISIC/Ara/pull/541))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajuste le layout de la barre d'actions sur la page d'audit ([#541](https://github.com/DISIC/Ara/pull/541))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">06/12/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Mise à jour du DSFR qui corrige notamment l’utiliisation des flèches directionnelles dans les champs de texte situés dans les onglets ([#576](https://github.com/DISIC/Ara/pull/576))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Déplace le champ du nom de la structure qui audite le site dans la page de déclaration ([#574](https://github.com/DISIC/Ara/pull/574))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">01/12/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajout de plus de contexte le message indiquant qu’aucun audit n’est présent sur le tableau de bord ([#577](https://github.com/DISIC/Ara/pull/577))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">30/11/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Comptes utilisateurs 👤 ([#396](https://github.com/DISIC/Ara/pull/396))
  - Création de compte sur l'application
  - Ajout d'une page permettant de retrouver tous ses audits
  - Gestion de son compte (email, mot-de-passe, suppression de compte, informations de profil)
  - Possibilité de pré-remplir les futurs audits avec les informations du profil

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">23/11/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige le problème de scroll qui cachait le titre de la thématique lors de l’utilisation des ancres de la barre latérale ([#562](https://github.com/DISIC/Ara/pull/562))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">16/11/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige le problème de scroll dans la barre des filtres qui rendaient la dernière thématique inatteignable ([#554](https://github.com/DISIC/Ara/pull/554))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">02/11/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout de filtres sur la conformité lors du remplissage de l’audit ([#479](https://github.com/DISIC/Ara/pull/479))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">25/10/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajoute les instructions pour faire des liens et ignorer le formattage en Markdown ([#519](https://github.com/DISIC/Ara/pull/519))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">29/09/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Si l’URL du site n’est pas renseignée, utilise l’URL de la première page auditée ([#487](https://github.com/DISIC/Ara/pull/487))
- Corrige le problème de disparition d’onglet lorsqu’on utilise les ancres depuis l’onglet "Notes" lors de la génération ([#483](https://github.com/DISIC/Ara/pull/483))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">08/09/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige les problèmes d’accessibilité suite au contre-audit ([#478](https://github.com/DISIC/Ara/pull/478))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Affiche un message clair et explicite sur le rapport quand aucune erreur n'a été relevée sur une page ([#465](https://github.com/DISIC/Ara/pull/465))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">06/09/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige la mise à jour des dates de publication et d’édition d’un audit pour que la date de publication ne puisse plus être postérieure à la date d’édition ([#461](https://github.com/DISIC/Ara/pull/461))
- Corrige le libellé du bouton de soumission sur la page d’édition des paramètres d’un audit ([#458](https://github.com/DISIC/Ara/pull/458))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Réorganise les pages d'aides et de ressources ([#466](https://github.com/DISIC/Ara/pull/466))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">30/06/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Cache le bloc de déclaration d’accessibilité sur la synthèse dans le cas d’un audit rapide ou complémentaire ([#459](https://github.com/DISIC/Ara/pull/459))
- Applique correctement la mise à jour du nom de la structure ([#454](https://github.com/DISIC/Ara/pull/454))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">27/06/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’un paramètre "Facile à corriger" sur les non-conformités ([#436](https://github.com/DISIC/Ara/pull/436))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">22/06/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajoute une page "Feuille de route" ([#426](https://github.com/DISIC/Ara/pull/426))
- Ajoute une page "Notes de versions" ([#426](https://github.com/DISIC/Ara/pull/426))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">16/06/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute un indicateur de progression de l'audit ([#423](https://github.com/DISIC/Ara/pull/423))
- AJoute un indicateur de d'enregistrement ([#423](https://github.com/DISIC/Ara/pull/423))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">14/06/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute l’URL de la page auditée dans son onglet ([#428](https://github.com/DISIC/Ara/pull/428))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">07/06/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Affiche correctement l’email de contact dans la déclaration d’accessibilité ([#425](https://github.com/DISIC/Ara/pull/425))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">02/06/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute la possibilité de télécharger le statut des critères de l'audit sous forme de fichier .CSV ([#410](https://github.com/DISIC/Ara/pull/410))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">01/06/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l'ordre des erreurs dans le détail des résultats sur le rapport
- Corrige le placement de la mention "Validation possible à la fin de l'audit"
- Corrige l'affichage des non-conformités transverses dans le rapport

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">31/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’une section de notes libres ([#405](https://github.com/DISIC/Ara/pull/405))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">26/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Rend la duplication d'un audit toujours faisable même si celui-ci n'est pas terminé ([#408](https://github.com/DISIC/Ara/pull/408))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">24/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’une option pour afficher ou non l’email de l’auditeur dans le rapport ([#393](https://github.com/DISIC/Ara/pull/393))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">18/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige la navigation depuis la page de génération d'audit ([#400](https://github.com/DISIC/Ara/pull/400))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">16/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’un bouton pour dupliquer un audit terminé ([#377](https://github.com/DISIC/Ara/pull/377))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">12/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Vérifie le poids des images d'exemple avant de les envoyer au serveur ([#394](https://github.com/DISIC/Ara/pull/394))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">11/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige l'application de l'état transverse d'un critère via le switch "Sur toutes les pages" qui était parfois ignoré.

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">10/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige une erreur qui survenait lorsqu'un champ de formulaire de type URL contenait un espace ([#386](https://github.com/DISIC/Ara/pull/386))
- Corrige l'ordre des erreurs dans l'onglet "Détail des résultats" du rapport d'audit ([#389](https://github.com/DISIC/Ara/pull/389))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Les accordéons "Description de la ou des erreurs" et "Recommandation de correction" sont remplacés par un unique accordéon "Description et recommandation" ([#390](https://github.com/DISIC/Ara/pull/390))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">05/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrige les onglets cassés lors de l'utilisation d'ancres ([#372](https://github.com/DISIC/Ara/pull/372))
- Corrige le filtre "Masquer les critères évalués" qui ne fonctionnait pas sur les audits rapides et complémentaires ([#373](https://github.com/DISIC/Ara/pull/373))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">04/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajout d’une notification pour signaler qu’un email avec les liens importants a été envoyé lors de la création d’un audit ([#368](https://github.com/DISIC/Ara/pull/368))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">03/05/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Remplacement des filtres de thématique par des ancres lors de la réalisation d’un audit ([#362](https://github.com/DISIC/Ara/pull/362))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">28/04/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Modifications mineures de la page d’accueil ([#361](https://github.com/DISIC/Ara/pull/361))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">19/04/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d'une aide à la saisie en Markdown accessible en cliquant sur le bouton "Markdown pris en compte" en dessous des champs texte concernés ([#350](https://github.com/DISIC/Ara/pull/350))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">05/04/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Lors de la création d'un audit, envoie d'un email contenant les liens vers l'audit et le rapport ([#314](https://github.com/DISIC/Ara/pull/314))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Mise à jour du titre de la page de génération d’audit ([#345](https://github.com/DISIC/Ara/pull/345))
- Ajout du métier "Auditeur / Auditrice accessibilité" dans le formulaire de retour ([#346](https://github.com/DISIC/Ara/pull/346))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">30/03/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’un bouton pour afficher ou cacher la barre latérale des filtres ([#322](https://github.com/DISIC/Ara/pull/322))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">24/03/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’un filtre pour cacher les tests et références des critères ([#329](https://github.com/DISIC/Ara/pull/329))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Petits ajustements d’affichage du contenu de la page Contexte d’un audit ([#331](https://github.com/DISIC/Ara/pull/331))
- Mise à jour du wording pour la saisie d’un moyen de contact dans la déclaration ([#330](https://github.com/DISIC/Ara/pull/330))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">23/03/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’un interrupteur pour marquer le résultat d’un critère comme transverse sur toutes les pages ([#317](https://github.com/DISIC/Ara/pull/317))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Mise à jour du DSFR en version `1.9.0` ([#326](https://github.com/DISIC/Ara/pull/326))
- Mise à jour de l’adresse email de contact : ara@design.numerique.gouv.fr ([#328](https://github.com/DISIC/Ara/pull/328))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">08/03/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’un lien de retour en haut de page pendant l’audit ([#316](https://github.com/DISIC/Ara/pull/316))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Améliore la gestion du focus à la fermeture des modales ([#297](https://github.com/DISIC/Ara/pull/297))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Un seul des 2 moyens de contact est obligatoire : email ou URL vers un formulaire ([#313](https://github.com/DISIC/Ara/pull/313))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">17/02/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Améliore la lisibilité du texte lorsque l'espacement des caractères est agrandi ([#305](https://github.com/DISIC/Ara/pull/305))
- Corrige l’affichage des longues URL dans le rapport ([#306](https://github.com/DISIC/Ara/pull/306))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">15/02/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Les retours à la lignes dans les commentaires et descriptions d'erreur sont rendu comme tel dans le rapport ([#301](https://github.com/DISIC/Ara/pull/301))
- Le lien vers l'audit en cours est enlevé du menu de navigation lorsque l'audit est supprimé ([#299](https://github.com/DISIC/Ara/pull/299/files))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">08/02/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Ajoute une alternative aux graphiques du rapport sous forme de tableau ([#287](https://github.com/DISIC/Ara/pull/287))
- Clarifie le statut de l’audit côté rapport ([#284](https://github.com/DISIC/Ara/pull/284))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">03/02/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajout d’une page _Données personnelles_ ([#291](https://github.com/DISIC/Ara/pull/291))
- Suppression de la mention "optionnel" sur la description et la recommandation de correction des critères non conformes ([#292](https://github.com/DISIC/Ara/pull/292))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">02/02/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Harmonise la navigation entre l’audit et le rapport ([#283](https://github.com/DISIC/Ara/pull/283))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">01/02/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’un statut d’enregistrement en haut de la page de remplissage de l’audit ([#281](https://github.com/DISIC/Ara/pull/281))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">25/01/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout de la possibilité d'ajouter des images d'exemples aux critères non-conformes ([#237](https://github.com/DISIC/Ara/pull/237/))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Mise à jour des données des donuts dans l'en-tête de l’audit ([#276](https://github.com/DISIC/Ara/pull/276))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">20/01/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout des paramètres d'affichage pour changer manuellement de thème de couleur ([#279](https://github.com/DISIC/Ara/pull/279))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Pertinence des titres ([#273](https://github.com/DISIC/Ara/pull/273))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">13/01/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ouverture des liens du rapport dans un nouvelle fenêtre ([#275](https://github.com/DISIC/Ara/pull/275))
- Mise à jour des outils d’assistance proposés par défaut ([#274](https://github.com/DISIC/Ara/pull/274))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Ajout de la vocalisation du nombre de résultats dans le rapport ([#254](https://github.com/DISIC/Ara/pull/254)) et des suppressions de pages ([#258](https://github.com/DISIC/Ara/pull/258))
- Ajout d'une mention textuelle pour les liens externes ([#272](https://github.com/DISIC/Ara/pull/272))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">11/01/2023</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Nouvelle interface pour les technologies, outils d’assistance et environnements lors du remplissage de la déclaration d’accessibilité ([#233](https://github.com/DISIC/Ara/pull/233)).

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Corrections de rôles `main` et `search` ([#255](https://github.com/DISIC/Ara/pull/255))
- Ajout du numéro de la thématique et du critère dans les labels des boutons radio de conformité ([#253](https://github.com/DISIC/Ara/pull/253))
- Gère l’annonce des liens externes ([#272](https://github.com/DISIC/Ara/pull/272))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Dans le rapport, déplace l'URL de la page sous son nom ([#257](https://github.com/DISIC/Ara/pull/257))

<h2 class="fr-sr-only" id="2022">2022</h2>

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">15/12/2022</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Mise à jour du wording et du lien pour copier la déclaration d’accessibilité ([#247](https://github.com/DISIC/Ara/pull/247))
- Supprime le lien vers le rapport dans le dropdown du header de la génération d’audit (déjà présent à côté) ([#245](https://github.com/DISIC/Ara/pull/245)).

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">14/12/2022</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajoute un message d'information sur le rapport des audits en cours ([#236](https://github.com/DISIC/Ara/pull/236))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajout d'un moniteur d'erreur afin de plus facilement detecter et corriger les problèmes techniques rencontrés par les utilisateurs ([#234](https://github.com/DISIC/Ara/pull/234))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">13/12/2022</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d'une description à chaque type d’audit lors de la création d’un audit ([#229](https://github.com/DISIC/Ara/pull/229))
- Ajout de l'URL de la page près de son nom dans le rapport d’erreurs ([#231](https://github.com/DISIC/Ara/pull/231))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Mise à jour de la mise en avant pour notifier le caractère obligatoire de la déclaration d’accessibilité ([#228](https://github.com/DISIC/Ara/pull/228))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">12/12/2022</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Formate les éléments suivant dans le rapport avec Markdown ([#227](https://github.com/DISIC/Ara/pull/227)) :
  - Description d'une erreur de conformité
  - Recommandation sur un critère
  - Non-conformités
  - Contenu dérogé
  - Contenus non soumis à l’obligation d’accessibilité
- Ajout d'une explication sur le calcul du taux de conformité sur le rapport ([#232](https://github.com/DISIC/Ara/pull/232))
- Cache les sections "Contenus non accessibles" vides dans le rapport
- Ajoute un message d'information sur la page de rapport d'un audit en cours ([#236](https://github.com/DISIC/Ara/pull/236)).

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🐛</span> Corrections</h4>

- Fixe les liens des pages auditées dans la page de contexte ([#235](https://github.com/DISIC/Ara/pull/235)).

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">30/11/2022</h3>

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">🚀</span> Nouvelles fonctionnalités</h4>

- Ajout d’une mise en avant pour notifier le caractère obligatoire de la déclaration d’accessibilité ([#206](https://github.com/DISIC/Ara/pull/206))

<h4 class="fr-text--xl fr-my-3v"><span aria-hidden="true">⚙️</span> Autres changements</h4>

- Ajout du changelog ([#207](https://github.com/DISIC/Ara/pull/207))

<h3 class="fr-h4 fr-mb-2w fr-mt-9v">16/11/2022</h3>

Lancement de la version bêta d'Ara. 🎉
