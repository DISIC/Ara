# Notes de version

<p class="intro">Cette page vous permet de suivre l’évolution du produit de manière transparente et continue. Tous les changements importants d'Ara sont listés ici, avec leur date, leur type (correction, nouvelle fonctionnalité, autres changements) et le lien vers la PR correspondante.</p>

<h2 class="fr-sr-only" id="2026">2026</h2>

### 25/02/2026

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- L’état (ouvert / fermé) des accordéons de thématiques est enregistré dans le navigateur pour chaque audit ([#1385](https://github.com/DISIC/Ara/pull/1385))

### 12/02/2026

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute les dates de publication et de modification de la déclaration d’accessibilité ([#1331](https://github.com/DISIC/Ara/pull/1331))
- Mettre le nouveau logo ARA sur le site ([#1386](https://github.com/DISIC/Ara/pull/1386))

### 28/01/2026

#### <span aria-hidden="true">🐛</span> Corrections

- Mise à jour de wordings plus clairs, de replacements de focus au clavier et de redirections plus cohérentes ([#1361](https://github.com/DISIC/Ara/pull/1361), [#1370](https://github.com/DISIC/Ara/pull/1370))

### 15/01/2026

#### <span aria-hidden="true">⚙️</span> Autres changements

- La déclaration d’accessibilité n’est plus dupliquée lors de la copie d’un audit ([#1346](https://github.com/DISIC/Ara/pull/1346))

#### <span aria-hidden="true">🐛</span> Corrections

- Un très long mot dépasse de l’éditeur riche ([#1368](https://github.com/DISIC/Ara/pull/1368))
- Ajouter un bouton "Haut de page" pour les pages dont le contenu est dense et harmoniser les liens "Retour à" ([#1359](https://github.com/DISIC/Ara/pull/1359))

### 14/01/2026

#### <span aria-hidden="true">🐛</span> Corrections

- Quand on duplique l'audit terminé, mettre la date de fin d'audit comme date du jour. Si l'audit à dupliquer n'est pas terminé, ne pas mettre de fin d'audit. ([#1360](https://github.com/DISIC/Ara/pull/1360))

### 09/01/2026

#### <span aria-hidden="true">🐛</span> Corrections

- Ajout de l'attribut `rel="noreferrer noopener"` pour les liens externes ([#1358](https://github.com/DISIC/Ara/pull/1358))
- Ajout du wording `nouvelle fenêtre` manquant sur des liens qui ouvrent une nouvelle fenêtre pour le lecteur d'écran ([#1358](https://github.com/DISIC/Ara/pull/1358))

<h2 class="fr-sr-only" id="2025">2025</h2>

### 17/12/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’affichage des liens trop longs dans l’éditeur riche ([#1340](https://github.com/DISIC/Ara/pull/1340))

### 16/12/2025

- Ara sort de sa bêta. 🎉

### 12/12/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Améliore le temps de réponse de la requête API des résultats ([#1321](https://github.com/DISIC/Ara/pull/1321))
- Ne mets pas à jour la date de mise à jour de l’audit quand seules certaines propriétés sont modifiées (nom du site audité, nom de l’auditeur, adresse e-mail de l’auditeur) ([#1312](https://github.com/DISIC/Ara/pull/1312))

### 28/11/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige une erreur qui dupliquait les commentaires des critères entre les pages ([#1320](https://github.com/DISIC/Ara/pull/1320))
- Ne mets pas à jour la date de mise à jour de l’audit quand seules certaines propriétés sont modifiées [#1312](https://github.com/DISIC/Ara/pull/1312)

### 26/11/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le libellé des titres de la page de déclaration d’accessibilité ([#1280](https://github.com/DISIC/Ara/pull/1280))
- Corrige des erreurs lors de l’ouverture d’un audit déjà chargé [#1315](https://github.com/DISIC/Ara/pull/1315)

#### <span aria-hidden="true">⚙️</span> Autres changements

- Améliore le temps de chargement du rapport pour les audits contenant de nombreuses pages ([#1313](https://github.com/DISIC/Ara/pull/1313))

### 19/11/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- L’ajout d’image se fait désormais directement dans la zone de texte, par copier-coller, glisser-déposer ou à l’aide du bouton « Insérer une image » ([#1270](https://github.com/DISIC/Ara/pull/1236))

#### <span aria-hidden="true">🐛</span> Corrections

- Ordonne les audits sur le tableau de bord et met ceux avec une date inconnue à la fin de la liste ([#1304](https://github.com/DISIC/Ara/pull/1304))
- Corrige un bug provoquant l’affichage d’une page d’erreur parfois lorsque l’on quitte la page d’un audit ([#1306](https://github.com/DISIC/Ara/pull/1306))

### 14/11/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige la validation de la section environnement de la déclaration ([#1300](https://github.com/DISIC/Ara/pull/1300))

### 12/11/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Désynchronise l’ouverture et la fermeture des critères d’une thématique avec le bouton "Non-applicable sur la page" ([#1270](https://github.com/DISIC/Ara/pull/1270))

### 31/10/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute un bouton pour afficher ou cacher manuellement l’ensemble des critères d’une thématique donnée ([#1251](https://github.com/DISIC/Ara/pull/1251))

### 08/10/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige les paramètres de l’audit parfois désynchronisé ([#1217](https://github.com/DISIC/Ara/pull/1217))
-  Corrige bug de focus lorsqu’une thématique est définies non-applicable ([#1219](https://github.com/DISIC/Ara/pull/1219)) 

### 07/10/2025

#### <span aria-hidden="true">🐛</span> Corrections

-  Corrige l’affichage des pictogrammes de l’étape 3 de création d’audit [#1226](https://github.com/DISIC/Ara/pull/1226)

### 03/10/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige crash lors du changement du type d’audit alors que les résultats étaient déjà chargés ([#1220](https://github.com/DISIC/Ara/pull/1220))

### 02/10/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

-  Ajoute des ancres vers les anomalies du rapport ([#1216](https://github.com/DISIC/Ara/pull/1216))

### 01/10/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Réinitialise correctement les filtres quand on change d’audit ([#1204](https://github.com/DISIC/Ara/pull/1204))
- Corrige le placement du focus après avoir fermé l’alerte de confirmation de renvoi de mail
[#1213](https://github.com/DISIC/Ara/pull/1213)

### 23/09/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le problème qui empêchait de passer certains critères liés sur les audits 25 ou 50 critères ([#1184](https://github.com/DISIC/Ara/pull/1184))

### 07/08/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Il est désormais possible d’ajouter des fichiers supérieurs à 1 Mo (la limite est de 2 Mo) ([#1173](https://github.com/DISIC/Ara/pull/1173))

### 06/08/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Certains critères passent automatiquement au statut « non applicable » si un critère lié est définit comme tel #823 ([#1151](https://github.com/DISIC/Ara/pull/1151))

### 30/07/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Mise à jour d’un niveau de titre dans la page de déclaration d’accessibilité ([#1173](https://github.com/DISIC/Ara/pull/1173))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Mise à jour du DSFR en version `1.14.0` ([#1167](https://github.com/DISIC/Ara/pull/1167))

### 23/07/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Les filtres du rapport d’audit ne désassocient plus les critères de leurs bons textes d’erreur & recommandation ([#1164](https://github.com/DISIC/Ara/pull/1161))
- Cache l'accordéon « En savoir plus sur le calcul du taux » pour les audits partiels ([#1164](https://github.com/DISIC/Ara/pull/1164))

### 10/07/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute la possibilité d’indiquer la présence ou l’absence d’éléments dans la page pour rendre une ou plusieurs thématiques non applicables ([#1147](https://github.com/DISIC/Ara/pull/1147))

### 26/06/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Améliore l’accessibilité des liens affichés dans le rapport d’audit (ceux ajoutés par l’utilisateur dans les éditeurs riches lors de l’audit) ([#1132](https://github.com/DISIC/Ara/pull/1132))

### 18/06/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Cache les critères d’une thématique définie comme « non applicable » ([#1135](https://github.com/DISIC/Ara/pull/1135))

#### <span aria-hidden="true">🐛</span> Corrections

- N’affiche pas la date du dernier enregistrement dans l’infobulle du nuage si cette information n’existe pas ([#1138](https://github.com/DISIC/Ara/pull/1138))
- Corrige la mise en page de la modale « Observations » ([#1133](https://github.com/DISIC/Ara/pull/1133))
- Cache l'onglet Point d'amélioration correctement lorsque les commentaires sont vides ([#1130](https://github.com/DISIC/Ara/pull/1130))

### 28/05/2025

#### <span aria-hidden="true">⚙️</span> Autres changements

- Mise à jour du menu principal de la page « Audit » et de la modale des observations (anciennement « Notes ») ([#1110](https://github.com/DISIC/Ara/pull/1110))
- Modifie le thème visuel des blocs de code de l’éditeur pour assurer un bon contraste des couleurs ([#1124](https://github.com/DISIC/Ara/pull/1124))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’accessibilité de la barre de progression de l’audit et de l’indicateur d’enregistrement ([#1115](https://github.com/DISIC/Ara/pull/1115))
- Corrige l’affichage de l’éditeur lorsque les CSS sont désactivées ([#1120](https://github.com/DISIC/Ara/pull/1120))

### 22/05/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’affichage des blocs de code dans l’éditeur quand le thème (clair ou sombre) du site est différent du thème système ([#1117](https://github.com/DISIC/Ara/pull/1117))

### 21/05/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le contraste de certains éléments du DSFR en hover ([#1105](https://github.com/DISIC/Ara/pull/1105))
- Améliore le titre des pages ([#1110](https://github.com/DISIC/Ara/pull/1100))

### 07/05/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le faible contraste des boutons de l’éditeur riche ([#1097](https://github.com/DISIC/Ara/pull/1097))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Améliore la lisibilité des cartes de statistiques de l’audit ([#1090](https://github.com/DISIC/Ara/pull/1090))

### 28/04/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’affichage des commentaires dans le rapport ([#1091](https://github.com/DISIC/Ara/pull/1091))

### 24/04/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige les erreurs et recommendations des éléments transverses affichés au format JSON ([#1080](https://github.com/DISIC/Ara/pull/1080))
- Corrige le commentaire des critères dupliqué entre les pages ([#1086](https://github.com/DISIC/Ara/pull/1086))
- Corrige la condition d'affichage de l'onglet des notes dans le rapport ([#1088](https://github.com/DISIC/Ara/pull/1088))

### 23/04/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Supprime les liens non explicites pour accéder à la déclaration et au rapport d’audit sur la synthèse ([#1044](https://github.com/DISIC/Ara/pull/1044))
- Ajoute des mentions sur les champs optionnels de la déclaration d’accessibilité et des paramètres de l’audit ([#1054](https://github.com/DISIC/Ara/pull/1054))

### 22/04/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute un éditeur riche pour les commentaires de critères et les notes d'audit ([#1018](https://github.com/DISIC/Ara/pull/1018))

### 14/04/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Plusieurs améliorations sur la navigation entre les différents onglets pendant l’audit et dans le rapport ([#950](https://github.com/DISIC/Ara/pull/950)) :
  - Les panneaux d’onglet sont désormais considérés comme des pages qui ont leur adresse (URL) propre et sont ajoutées dans l’historique de navigation ;
  - lorsque l’on accède à un onglet, la page défile pour placer les onglets en haut de l’écran ;
  - l’onglet actif reste toujours visible, même sur petit écran et avec une navigation au clavier.
- Corrige la mauvaise position verticale dans la page après utilisation des ancres « Pages » du rapport
- Correction du contraste des cartes de types d’audit ([#1056](https://github.com/DISIC/Ara/pull/1056))

### 09/04/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le calcul du nombre de critères non applicables par page dans le rapport ([#1039](https://github.com/DISIC/Ara/pull/1039))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Permet la fermeture du bandeau de retour utilisateur ([#1042](https://github.com/DISIC/Ara/pull/1042))

### 03/04/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’affichage du contenu des infobulles lorsque le CSS est désactivé ([#1025](https://github.com/DISIC/Ara/pull/1025))
- Ajoute des bordures aux champs de saisie pour améliorer leur accessibilité ([#1038](https://github.com/DISIC/Ara/pull/1038))

### 26/03/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige les accordéons qui fermaient les accordéons parents lorsqu’on souhaitait les fermer ([#1017](https://github.com/DISIC/Ara/pull/1017))

### 20/03/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’affichage sans CSS du composant pour l’ajout de technologies, d’outils d’assistance ou d’éléments transverses ([#1014](https://github.com/DISIC/Ara/pull/1014))

### 19/03/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Ajoute un titre manquant sur l’onglet des notes sur le rapport ([#1002](https://github.com/DISIC/Ara/pull/1002))

### 12/03/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute une liste éditable des éléments audités dans l'onglet transverse ([#964](https://github.com/DISIC/Ara/pull/964))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Revoit la navigation entre les pages de l’audit ([#937](https://github.com/DISIC/Ara/pull/937))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige la hiérarchie des titres dans les onglets du rapport ([#975](https://github.com/DISIC/Ara/pull/975))
- Ajoute un attribut `lang="en"` aux noms d’outils, de navigateurs et de technologies d’assistance dans la déclaration d’accessibilité ([#974](https://github.com/DISIC/Ara/pull/974))
- Cache de manière accessible l’emoji de la bannière de bienvenue ([#973](https://github.com/DISIC/Ara/pull/973))

### 05/03/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute les cas particuliers et les notes techniques aux critères de l’audit ([#947](https://github.com/DISIC/Ara/pull/947))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Amélioration de la visibilité des ancres dans la barre latérale de l’audit ([#957](https://github.com/DISIC/Ara/pull/957))

### 07/02/2025

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute une aide et des exemples sur l’impact usager ([#928](https://github.com/DISIC/Ara/pull/928))

### 06/02/2025

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige la hiérarchie des titres et les annonces d’enregistrement pour les technologies d’assistance ([#933](https://github.com/DISIC/Ara/pull/933))

### 05/02/2025

#### <span aria-hidden="true">⚙️</span> Autres changements

- Améliore l’affichage des erreurs et points d’amélioration dans le rapport ([#929](https://github.com/DISIC/Ara/pull/929))
- Explicite l'ouverture des livrables dans un nouvel onglet ([#932](https://github.com/DISIC/Ara/pull/932))

### 22/01/2025

#### <span aria-hidden="true">⚙️</span> Autres changements

- Affiche le taux de progression de l’audit sur la page « Mes audits » ([#914](https://github.com/DISIC/Ara/pull/914))
- Ne demande pas son adresse email à un utilisateur déjà connecté lors de la réinitialisation de mot de passe ([#926](https://github.com/DISIC/Ara/pull/926))

### 16/01/2025

#### <span aria-hidden="true">⚙️</span> Autres changements

- Supprime la page « Contexte » ([#924](https://github.com/DISIC/Ara/pull/924))

### 10/01/2025

#### <span aria-hidden="true">⚙️</span> Autres changements

- Mise à jour du DSFR en version `1.13.0` ([#915](https://github.com/DISIC/Ara/pull/915))

<h2 class="fr-sr-only" id="2024">2024</h2>

### 18/12/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige les menus déroulants en rendant le code HTML généré valide ([#881](https://github.com/DISIC/Ara/pull/881))
- Corrige la mauvaise position verticale dans la page après utilisation des ancres « Pages » du rapport ([#879](https://github.com/DISIC/Ara/pull/879))

### 13/12/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige la position des infobulle « Non applicable » sur la liste des audits ([#904](https://github.com/DISIC/Ara/pull/904))

### 12/12/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le formulaire de retour après avoir supprimé le compte ([#907](https://github.com/DISIC/Ara/pull/907))

### 11/12/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajoute un lien de retour sur la page de création d’audit ([#902](https://github.com/DISIC/Ara/pull/902))
- Ajoute un lien vers les paramètres de l’audit dans la synthèse et la liste des audits ([#900](https://github.com/DISIC/Ara/pull/900))
- Ajuste le contenu de l’email de création d’audit ([#901](https://github.com/DISIC/Ara/pull/901))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le lien et l’icône des audits « non commencés » dans la liste des audits du compte ([#886](https://github.com/DISIC/Ara/pull/886))

### 06/12/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige la possibilité de supprimer une image liée à un critère d’élément transverse ([#898](https://github.com/DISIC/Ara/pull/898))

### 27/11/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Affiche seulement les pages avec des commentaires C ou NA dans l’onglet du rapport « Points d’amélioration » ([#884](https://github.com/DISIC/Ara/pull/884))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’ordre des pages dans le tableau de répartition des critères par page dans le rapport ([#885](https://github.com/DISIC/Ara/pull/885))

### 22/11/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Change le texte du bouton principal des audits à 0% dans la liste des audits de « Continuer l’audit » à « Commencer l’audit » ([#843](https://github.com/DISIC/Ara/pull/843))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le problème des filtres des critères qui décalait l’ordre des pages de l’échantillon sur la page d’audit ([#877](https://github.com/DISIC/Ara/pull/877))
- Corrige la « fausse » mise à jour des paramètres de l’audit quand on quitte la page sans sauvegarder ([#875](https://github.com/DISIC/Ara/pull/875))

### 21/11/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige un mauvais calcul d’arrondi sur la complétion des thématiques de l’audit ([#882](https://github.com/DISIC/Ara/pull/882))

### 20/11/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige un problème de vocalisation de lecteur d’écran sur la page du tableau de bord ([#883](https://github.com/DISIC/Ara/pull/883))

### 15/11/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige un bug lié à l'ancienne gestion des critères transverses provoquant parfois des écrasenements de données ([#876](https://github.com/DISIC/Ara/pull/876))

### 07/11/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Affiche le bon statut des audits dans la liste des audits du compte en fonction de leur complétion ([#822](https://github.com/DISIC/Ara/pull/822))

### 06/11/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Affiche le commentaire correspondant au statut du critère (C ou NA) dans le rapport d’audit ([#844](https://github.com/DISIC/Ara/pull/844))
- Ordonne correctement les pages dans la déclaration d’accessibilité et le contexte de l’audit ([#819](https://github.com/DISIC/Ara/pull/819))
- Ordonne les audits du tableau de bord par date de création descendante (du plus récent au plus ancien) ([#821](https://github.com/DISIC/Ara/pull/821))

### 31/10/2024

- Corrige un bug rendant impossible la duplication d'un audit contenant des images d'exemple pour des critères transverses ([#836](https://github.com/DISIC/Ara/pull/836))

### 18/10/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajout de liens de recours dans la déclaration d’accessibilité générée ([#812](https://github.com/DISIC/Ara/pull/812))

### 17/10/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Modifie la gestion des éléments transverses : l’interrupteur « Sur toutes les pages » est remplacé par l’onglet « Éléments transverses » qui permet d’évaluer les éléments communs à toutes les pages : en-tête, pied de page... ([#758](https://github.com/DISIC/Ara/pull/758))

### 09/10/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige la mise à jour de l’ordre des pages quand les 2 pages ne sont pas adjacentes ([#809](https://github.com/DISIC/Ara/pull/809))
- Corrige l’application de l'attribut `autocomplete` sur le champ « email » du formulaire de connexion ([#808](https://github.com/DISIC/Ara/pull/808))

### 05/09/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute une modale de confirmation lors de la suppression d’une pièce jointe sur un critère « Non conforme » ([#788](https://github.com/DISIC/Ara/pull/788))
- Met automatiquement le focus sur le champs « Erreur et recommandation » lorsque qu’un critère est défini comme « Non conforme » ([#766](https://github.com/DISIC/Ara/pull/766))

### 24/07/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajoute une information pour préciser la nature des contenus dans l’onglet « Points d’améliorations » ([#764](https://github.com/DISIC/Ara/pull/764))
- Simplifie l’ajout d’environnements de test personnalisés ([#765](https://github.com/DISIC/Ara/pull/765))

### 11/07/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Le lien d’ancre « Haut de page » entre les thématiques de l’audit renvoie vers désormais vers le haut des onglets plutôt que l’en-tête du site ([#750](https://github.com/DISIC/Ara/pull/750))

### 10/07/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’onglet des notes qui n’était pas affiché lorsque l’audit avait des pièces jointes mais pas de notes textuelles ([#753](https://github.com/DISIC/Ara/pull/753))

### 03/07/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute les critères conformes et non applicables au rapport dans l’onglet « Points d’améliorations » ([#732](https://github.com/DISIC/Ara/pull/732))

#### <span aria-hidden="true">🐛</span> Corrections

- Correction des filtres de critères qui ne fonctionnaient pas correctement dans certains cas ([#737](https://github.com/DISIC/Ara/pull/737))

### 26/06/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute la possibilité de télécharger (téléverser) des fichiers – « pièces jointes » – au niveau des annotations de l’audit ([#669](https://github.com/DISIC/Ara/pull/669)) :
  - Agrandissement de la zone d’annotation en panneau latéral
  - Sauvegarde automatique des changements
  - Création d’un composant d’ajout de fichier commun (critères non conformes + annotations)
  - Choix de _télécharger_ ou de _visualiser_ chaque fichier
  - Affichage des pièces jointes dans les notes du rapport d’audit
  - Suppression des bannières de notification d’ajout et de suppression de fichier
  - Affichage de la syntaxe Markdown dans une page séparée (au lieu d’une modale)

### 12/06/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Fusionne les champs « Recommandation » et « Description de l'erreur » ([#720](https://github.com/DISIC/Ara/pull/720))

### 06/06/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige un problème du filtre de conformité des critères ([#726](https://github.com/DISIC/Ara/pull/726))
- Corrige la validation des champs URL pour être plus flexible ([#727](https://github.com/DISIC/Ara/pull/727))

### 05/06/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Permet d’accéder au rapport depuis la déclaration et vice-versa ([#725](https://github.com/DISIC/Ara/pull/725))

### 31/05/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Séquence le paramétrage d’un audit en plusieurs étapes ([#702](https://github.com/DISIC/Ara/pull/702))

### 24/05/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige des `id` dupliqués dans les modales de duplication et de suppression d’audit ([#712](https://github.com/DISIC/Ara/pull/712))

### 23/05/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Permet d’accéder à un rapport quand l’audit est supprimé ([#662](https://github.com/DISIC/Ara/pull/662))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’URL copiée de la déclaration d’accessibilité ([#713](https://github.com/DISIC/Ara/pull/713))

### 26/04/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajoute un lien de retour vers le rapport depuis la page de contexte de l’audit ([#703](https://github.com/DISIC/Ara/pull/703))

### 17/04/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Détache la déclaration d’accessibilité du rapport d’accessibilité ([#696](https://github.com/DISIC/Ara/pull/696))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le problème d’ordre des pages sur le rapport ([#692](https://github.com/DISIC/Ara/pull/692))

### 10/04/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Améliore la navigation entre les différents espaces du site : audit, compte utilisateur et livrables ([#683](https://github.com/DISIC/Ara/pull/683))

### 05/04/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute la possibilité de filtrer les critères par statut « Non testé » lors de la réalisation de l’audit ([#693](https://github.com/DISIC/Ara/pull/693))

### 07/03/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Améliorer l’affichage sur mobile du header sticky sur la page de génération de l’audit ([#678](https://github.com/DISIC/Ara/pull/678))
- Corrige l’affichage des donuts des statistiques parfois désactivés ([#676](https://github.com/DISIC/Ara/pull/676))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Supprime la rubrique des ressources ([#675](https://github.com/DISIC/Ara/pull/675))

### 22/02/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajoute des liens d’accès dans le menu déroulant d’un audit sur la page « Mes audits » ([#658](https://github.com/DISIC/Ara/pull/658))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’affichage du taux de conformité dans les cartes des donuts et harmonise les cartes entre l’audit et le rapport ([#661](https://github.com/DISIC/Ara/pull/661))

### 16/02/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’affichage du bandeau « Audit en cours » qui parfois n’était pas visible ([#659](https://github.com/DISIC/Ara/pull/659))

### 31/01/2024

#### <span aria-hidden="true">🐛</span> Corrections

- Empêche la création de pages avec des espaces dans l’URL ([#623](https://github.com/DISIC/Ara/pull/623))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Corrige l’accessibilité de l’indicateur d’étape terminée sur la synthèse d’un audit ([#630](https://github.com/DISIC/Ara/pull/630))

### 25/01/2024

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute la possibilité de changer l’ordre des pages de l’échantillon depuis les paramètres de l’audit ([#613](https://github.com/DISIC/Ara/pull/613))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige la navigation au clavier des onglets des pages de l’audit ([#625](https://github.com/DISIC/Ara/pull/625))

### 18/01/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Améliorer l’accessibilité et la compréhension de l’onglet du détail des résultats ([#606](https://github.com/DISIC/Ara/pull/606))

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l’affichage des blocs de page de la page de paramètres sur Safari ([#608](https://github.com/DISIC/Ara/pull/608))

### 16/01/2024

#### <span aria-hidden="true">⚙️</span> Autres changements

- Informe mieux l’usager sur les différents types d’audits lors du paramétrage d’un audit ([#604](https://github.com/DISIC/Ara/pull/604))

<h2 class="fr-sr-only" id="2023">2023</h2>

### 14/12/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’une page synthèse pour faciliter l’accès aux documents liés à l’audit ([#579](https://github.com/DISIC/Ara/pull/579))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Déplacement des notes dans l’en-tête de la page de génération de l’audit ([#579](https://github.com/DISIC/Ara/pull/579))

### 11/12/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige un bug qui empêchait l’ouverture des modales ([#583](https://github.com/DISIC/Ara/pull/583))
- Corrige le message d’erreur lors de la duplication d’un audit depuis la page de l’audit ([#584](https://github.com/DISIC/Ara/pull/584))
- Corrige l’affichage des interrupteurs suite à la mise à jour du DSFR ([#586](https://github.com/DISIC/Ara/pull/586))

### 08/12/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Les onglets de page sur la page d'audit sont maintenant collés au haut de l'écran ([#541](https://github.com/DISIC/Ara/pull/541))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajuste le layout de la barre d'actions sur la page d'audit ([#541](https://github.com/DISIC/Ara/pull/541))

### 06/12/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Mise à jour du DSFR qui corrige notamment l’utiliisation des flèches directionnelles dans les champs de texte situés dans les onglets ([#576](https://github.com/DISIC/Ara/pull/576))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Déplace le champ du nom de la structure qui audite le site dans la page de déclaration ([#574](https://github.com/DISIC/Ara/pull/574))

### 01/12/2023

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajout de plus de contexte le message indiquant qu’aucun audit n’est présent sur le tableau de bord ([#577](https://github.com/DISIC/Ara/pull/577))

### 30/11/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Comptes utilisateurs 👤 ([#396](https://github.com/DISIC/Ara/pull/396))
  - Création de compte sur l'application
  - Ajout d'une page permettant de retrouver tous ses audits
  - Gestion de son compte (email, mot-de-passe, suppression de compte, informations de profil)
  - Possibilité de pré-remplir les futurs audits avec les informations du profil

### 23/11/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le problème de scroll qui cachait le titre de la thématique lors de l’utilisation des ancres de la barre latérale ([#562](https://github.com/DISIC/Ara/pull/562))

### 16/11/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige le problème de scroll dans la barre des filtres qui rendaient la dernière thématique inatteignable ([#554](https://github.com/DISIC/Ara/pull/554))

### 02/11/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout de filtres sur la conformité lors du remplissage de l’audit ([#479](https://github.com/DISIC/Ara/pull/479))

### 25/10/2023

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajoute les instructions pour faire des liens et ignorer le formattage en Markdown ([#519](https://github.com/DISIC/Ara/pull/519))

### 29/09/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Si l’URL du site n’est pas renseignée, utilise l’URL de la première page auditée ([#487](https://github.com/DISIC/Ara/pull/487))
- Corrige le problème de disparition d’onglet lorsqu’on utilise les ancres depuis l’onglet « Notes » lors de la génération ([#483](https://github.com/DISIC/Ara/pull/483))

### 08/09/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige les problèmes d’accessibilité suite au contre-audit ([#478](https://github.com/DISIC/Ara/pull/478))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Affiche un message clair et explicite sur le rapport quand aucune erreur n'a été relevée sur une page ([#465](https://github.com/DISIC/Ara/pull/465))

### 06/09/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige la mise à jour des dates de publication et d’édition d’un audit pour que la date de publication ne puisse plus être postérieure à la date d’édition ([#461](https://github.com/DISIC/Ara/pull/461))
- Corrige le libellé du bouton de soumission sur la page d’édition des paramètres d’un audit ([#458](https://github.com/DISIC/Ara/pull/458))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Réorganise les pages d'aides et de ressources ([#466](https://github.com/DISIC/Ara/pull/466))

### 30/06/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Cache le bloc de déclaration d’accessibilité sur la synthèse dans le cas d’un audit rapide ou complémentaire ([#459](https://github.com/DISIC/Ara/pull/459))
- Applique correctement la mise à jour du nom de la structure ([#454](https://github.com/DISIC/Ara/pull/454))

### 27/06/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’un paramètre « Facile à corriger » sur les non-conformités ([#436](https://github.com/DISIC/Ara/pull/436))

### 22/06/2023

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajoute une page « Feuille de route » ([#426](https://github.com/DISIC/Ara/pull/426))
- Ajoute une page « Notes de versions » ([#426](https://github.com/DISIC/Ara/pull/426))

### 16/06/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute un indicateur de progression de l'audit ([#423](https://github.com/DISIC/Ara/pull/423))
- AJoute un indicateur de d'enregistrement ([#423](https://github.com/DISIC/Ara/pull/423))

### 14/06/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute l’URL de la page auditée dans son onglet ([#428](https://github.com/DISIC/Ara/pull/428))

### 07/06/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Affiche correctement l’email de contact dans la déclaration d’accessibilité ([#425](https://github.com/DISIC/Ara/pull/425))

### 02/06/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute la possibilité de télécharger le statut des critères de l'audit sous forme de fichier .CSV ([#410](https://github.com/DISIC/Ara/pull/410))

### 01/06/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l'ordre des erreurs dans le détail des résultats sur le rapport
- Corrige le placement de la mention « Validation possible à la fin de l'audit »
- Corrige l'affichage des non-conformités transverses dans le rapport

### 31/05/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’une section de notes libres ([#405](https://github.com/DISIC/Ara/pull/405))

### 26/05/2023

#### <span aria-hidden="true">⚙️</span> Autres changements

- Rend la duplication d'un audit toujours faisable même si celui-ci n'est pas terminé ([#408](https://github.com/DISIC/Ara/pull/408))

### 24/05/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’une option pour afficher ou non l’email de l’auditeur dans le rapport ([#393](https://github.com/DISIC/Ara/pull/393))

### 18/05/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige la navigation depuis la page de génération d'audit ([#400](https://github.com/DISIC/Ara/pull/400))

### 16/05/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’un bouton pour dupliquer un audit terminé ([#377](https://github.com/DISIC/Ara/pull/377))

### 12/05/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Vérifie le poids des images d'exemple avant de les envoyer au serveur ([#394](https://github.com/DISIC/Ara/pull/394))

### 11/05/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige l'application de l'état transverse d'un critère via le switch « Sur toutes les pages » qui était parfois ignoré.

### 10/05/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige une erreur qui survenait lorsqu'un champ de formulaire de type URL contenait un espace ([#386](https://github.com/DISIC/Ara/pull/386))
- Corrige l'ordre des erreurs dans l'onglet « Détail des résultats » du rapport d'audit ([#389](https://github.com/DISIC/Ara/pull/389))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Les accordéons « Description de la ou des erreurs » et « Recommandation de correction » sont remplacés par un unique accordéon « Description et recommandation » ([#390](https://github.com/DISIC/Ara/pull/390))

### 05/05/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Corrige les onglets cassés lors de l'utilisation d'ancres ([#372](https://github.com/DISIC/Ara/pull/372))
- Corrige le filtre « Masquer les critères évalués » qui ne fonctionnait pas sur les audits rapides et complémentaires ([#373](https://github.com/DISIC/Ara/pull/373))

### 04/05/2023

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajout d’une notification pour signaler qu’un email avec les liens importants a été envoyé lors de la création d’un audit ([#368](https://github.com/DISIC/Ara/pull/368))

### 03/05/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Remplacement des filtres de thématique par des ancres lors de la réalisation d’un audit ([#362](https://github.com/DISIC/Ara/pull/362))

### 28/04/2023

#### <span aria-hidden="true">⚙️</span> Autres changements

- Modifications mineures de la page d’accueil ([#361](https://github.com/DISIC/Ara/pull/361))

### 19/04/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d'une aide à la saisie en Markdown accessible en cliquant sur le bouton « Markdown pris en compte » en dessous des champs texte concernés ([#350](https://github.com/DISIC/Ara/pull/350))

### 05/04/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Lors de la création d'un audit, envoie d'un email contenant les liens vers l'audit et le rapport ([#314](https://github.com/DISIC/Ara/pull/314))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Mise à jour du titre de la page de génération d’audit ([#345](https://github.com/DISIC/Ara/pull/345))
- Ajout du métier « Auditeur / Auditrice accessibilité » dans le formulaire de retour ([#346](https://github.com/DISIC/Ara/pull/346))

### 30/03/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’un bouton pour afficher ou cacher la barre latérale des filtres ([#322](https://github.com/DISIC/Ara/pull/322))

### 24/03/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’un filtre pour cacher les tests et références des critères ([#329](https://github.com/DISIC/Ara/pull/329))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Petits ajustements d’affichage du contenu de la page Contexte d’un audit ([#331](https://github.com/DISIC/Ara/pull/331))
- Mise à jour du wording pour la saisie d’un moyen de contact dans la déclaration ([#330](https://github.com/DISIC/Ara/pull/330))

### 23/03/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’un interrupteur pour marquer le résultat d’un critère comme transverse sur toutes les pages ([#317](https://github.com/DISIC/Ara/pull/317))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Mise à jour du DSFR en version `1.9.0` ([#326](https://github.com/DISIC/Ara/pull/326))
- Mise à jour de l’adresse email de contact : ara@design.numerique.gouv.fr ([#328](https://github.com/DISIC/Ara/pull/328))

### 08/03/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’un lien de retour en haut de page pendant l’audit ([#316](https://github.com/DISIC/Ara/pull/316))

#### <span aria-hidden="true">🐛</span> Corrections

- Améliore la gestion du focus à la fermeture des modales ([#297](https://github.com/DISIC/Ara/pull/297))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Un seul des 2 moyens de contact est obligatoire : email ou URL vers un formulaire ([#313](https://github.com/DISIC/Ara/pull/313))

### 17/02/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Améliore la lisibilité du texte lorsque l'espacement des caractères est agrandi ([#305](https://github.com/DISIC/Ara/pull/305))
- Corrige l’affichage des longues URL dans le rapport ([#306](https://github.com/DISIC/Ara/pull/306))

### 15/02/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Les retours à la lignes dans les commentaires et descriptions d'erreur sont rendu comme tel dans le rapport ([#301](https://github.com/DISIC/Ara/pull/301))
- Le lien vers l'audit en cours est enlevé du menu de navigation lorsque l'audit est supprimé ([#299](https://github.com/DISIC/Ara/pull/299/files))

### 08/02/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Ajoute une alternative aux graphiques du rapport sous forme de tableau ([#287](https://github.com/DISIC/Ara/pull/287))
- Clarifie le statut de l’audit côté rapport ([#284](https://github.com/DISIC/Ara/pull/284))

### 03/02/2023

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajout d’une page _Données personnelles_ ([#291](https://github.com/DISIC/Ara/pull/291))
- Suppression de la mention « optionnel » sur la description et la recommandation de correction des critères non conformes ([#292](https://github.com/DISIC/Ara/pull/292))

### 02/02/2023

#### <span aria-hidden="true">🐛</span> Corrections

- Harmonise la navigation entre l’audit et le rapport ([#283](https://github.com/DISIC/Ara/pull/283))

### 01/02/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’un statut d’enregistrement en haut de la page de remplissage de l’audit ([#281](https://github.com/DISIC/Ara/pull/281))

### 25/01/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout de la possibilité d'ajouter des images d'exemples aux critères non conformes ([#237](https://github.com/DISIC/Ara/pull/237/))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Mise à jour des données des donuts dans l'en-tête de l’audit ([#276](https://github.com/DISIC/Ara/pull/276))

### 20/01/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout des paramètres d'affichage pour changer manuellement de thème de couleur ([#279](https://github.com/DISIC/Ara/pull/279))

#### <span aria-hidden="true">🐛</span> Corrections

- Pertinence des titres ([#273](https://github.com/DISIC/Ara/pull/273))

### 13/01/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ouverture des liens du rapport dans un nouvelle fenêtre ([#275](https://github.com/DISIC/Ara/pull/275))
- Mise à jour des outils d’assistance proposés par défaut ([#274](https://github.com/DISIC/Ara/pull/274))

#### <span aria-hidden="true">🐛</span> Corrections

- Ajout de la vocalisation du nombre de résultats dans le rapport ([#254](https://github.com/DISIC/Ara/pull/254)) et des suppressions de pages ([#258](https://github.com/DISIC/Ara/pull/258))
- Ajout d'une mention textuelle pour les liens externes ([#272](https://github.com/DISIC/Ara/pull/272))

### 11/01/2023

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Nouvelle interface pour les technologies, outils d’assistance et environnements lors du remplissage de la déclaration d’accessibilité ([#233](https://github.com/DISIC/Ara/pull/233)).

#### <span aria-hidden="true">🐛</span> Corrections

- Corrections de rôles `main` et `search` ([#255](https://github.com/DISIC/Ara/pull/255))
- Ajout du numéro de la thématique et du critère dans les labels des boutons radio de conformité ([#253](https://github.com/DISIC/Ara/pull/253))
- Gère l’annonce des liens externes ([#272](https://github.com/DISIC/Ara/pull/272))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Dans le rapport, déplace l'URL de la page sous son nom ([#257](https://github.com/DISIC/Ara/pull/257))

<h2 class="fr-sr-only" id="2022">2022</h2>

### 15/12/2022

#### <span aria-hidden="true">🐛</span> Corrections

- Mise à jour du wording et du lien pour copier la déclaration d’accessibilité ([#247](https://github.com/DISIC/Ara/pull/247))
- Supprime le lien vers le rapport dans le dropdown du header de la génération d’audit (déjà présent à côté) ([#245](https://github.com/DISIC/Ara/pull/245)).

### 14/12/2022

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajoute un message d'information sur le rapport des audits en cours ([#236](https://github.com/DISIC/Ara/pull/236))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajout d'un moniteur d'erreur afin de plus facilement detecter et corriger les problèmes techniques rencontrés par les utilisateurs ([#234](https://github.com/DISIC/Ara/pull/234))

### 13/12/2022

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d'une description à chaque type d’audit lors de la création d’un audit ([#229](https://github.com/DISIC/Ara/pull/229))
- Ajout de l'URL de la page près de son nom dans le rapport d’erreurs ([#231](https://github.com/DISIC/Ara/pull/231))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Mise à jour de la mise en avant pour notifier le caractère obligatoire de la déclaration d’accessibilité ([#228](https://github.com/DISIC/Ara/pull/228))

### 12/12/2022

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Formate les éléments suivant dans le rapport avec Markdown ([#227](https://github.com/DISIC/Ara/pull/227)) :
  - Description d'une erreur de conformité
  - Recommandation sur un critère
  - Non-conformités
  - Contenu dérogé
  - Contenus non soumis à l’obligation d’accessibilité
- Ajout d'une explication sur le calcul du taux de conformité sur le rapport ([#232](https://github.com/DISIC/Ara/pull/232))
- Cache les sections « Contenus non accessibles » vides dans le rapport
- Ajoute un message d'information sur la page de rapport d'un audit en cours ([#236](https://github.com/DISIC/Ara/pull/236)).

#### <span aria-hidden="true">🐛</span> Corrections

- Fixe les liens des pages auditées dans la page de contexte ([#235](https://github.com/DISIC/Ara/pull/235)).

### 30/11/2022

#### <span aria-hidden="true">🚀</span> Nouvelles fonctionnalités

- Ajout d’une mise en avant pour notifier le caractère obligatoire de la déclaration d’accessibilité ([#206](https://github.com/DISIC/Ara/pull/206))

#### <span aria-hidden="true">⚙️</span> Autres changements

- Ajout du changelog ([#207](https://github.com/DISIC/Ara/pull/207))

### 16/11/2022

- Lancement de la version bêta d'Ara. 🎉
