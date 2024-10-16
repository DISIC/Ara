# Documentation

Ce fichier détaille les règles métiers utilisées au sein du projet.

## Calcul du nombre de critères

Le statut final d’un critère est déterminé en calculant le résultat de l’ensemble des statuts sur chaque page et sur les éléments transverses pour ce critère.

### Critères applicables

Un critère est applicable si :

- il est conforme ou non-conforme sur au moins une page ou sur les éléments transverses.

### Critères non-applicables

Un critère est non-applicable si :

- il est non-applicable sur l’ensemble des pages et sur les éléments transverses testés.

### Critères conformes

Un critère est conforme si :

- il est conforme ou non-applicable sur l’ensemble des pages et sur les éléments transverses testés.
- il est conforme sur au moins une page ou sur les éléments transverses testés.

### Critères non-conformes

Un critère est non-conforme si :

- il est non-conforme sur au moins une page ou sur les éléments transverses.

## Taux de conformité d’un audit

Le taux de conformité d’un audit se fait selon le calcul suivant :

```
Taux de conformité = (Nombre de critères conformes / Nombre de critères applicables) * 100
```

Exemple avec 89 critères applicables et 27 critères conformes :

```
Taux de conformité = (27 / 89) * 100 = 30,34%
```
