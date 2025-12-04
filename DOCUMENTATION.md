# Documentation

Ce fichier détaille les règles métiers utilisées au sein du projet.

## Calcul du nombre de critères

Le statut final d’un critère est déterminé en calculant le résultat de l’ensemble des statuts sur chaque page et sur les éléments transverses pour ce critère.

### Critères applicables

Un critère est applicable si :

- il est conforme ou non-conforme sur au moins une page ou sur les éléments transverses.

### Critères non-applicables

Un critère est non-applicable si :

- il est non-applicable sur l’ensemble des pages et sur les éléments transverses testés.

### Critères conformes

Un critère est conforme si :

- il est conforme ou non-applicable sur l’ensemble des pages et sur les éléments transverses testés.
- il est conforme sur au moins une page ou sur les éléments transverses testés.

### Critères non-conformes

Un critère est non-conforme si :

- il est non-conforme sur au moins une page ou sur les éléments transverses.

## Taux de conformité d’un audit

Le taux de conformité d’un audit se fait selon le calcul suivant :

```
Taux de conformité = (Nombre de critères conformes / Nombre de critères applicables) * 100
```

Exemple avec 89 critères applicables et 27 critères conformes :

```
Taux de conformité = (27 / 89) * 100 = 30,34%
```

## Statut d’un audit

Un audit est considéré...

- **En cours** si tous les critères ne sont pas testés (hors éléments transverses).
- **Terminé** si tous les critères sont testés (hors éléments transverses) et qu’il a une date de publication.
- **Modifié** si tous les critères sont testés (hors éléments transverses), qu’il a une date de publication et une date d’édition.

## Dates

### Création de l'audit

Date à laquelle le paramétrage initial de l’audit est validé :

- Soumission du formulaire de paramétrage d'un audit.

### Publication de l'audit

Date à laquelle le dernier critère d'un audit est évalué :

- Évaluation (C, NC ou NA) du dernier critère "Non testé" d'un audit.

### Modification de l'audit

Date à laquelle un audit terminé est modifié :

- Soumission du formulaire de paramétrage d'un audit.
- Modification du statut, commentaire d'un critère d'un audit.
- Modification des notes d'un audit.
- Soumission du formulaire de déclaration d'accessibilité.

### Publication de la déclaration d'accessibilité

Date à laquelle la déclaration d'accessibilité est publiée pour la première fois :

- Soumission du formulaire de déclaration d'accessibilité.

### Modification de la déclaration d'accessibilité

Date à laquelle une déclaration d'accessibilité déjà publiée est modifiée :

- Lors de la soumission du formulaire de déclaration d'accessibilité.
- Lors de la mise à jour de l'audit (paramètres, statut d'un critère...).
