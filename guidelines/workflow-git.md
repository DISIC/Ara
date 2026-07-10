# Workflow git / GitHub

Avant la prise en main d’un ticket, il faut s’assurer des choses suivantes :

- Le périmètre du ticket n’est pas trop large.
- Le ticket est suffisemment détaillé et comporte toutes les informations requises pour démarrer.

> [!TIP]
> En cas de doute sur la solution technique à implémenter, il peut être nécessaire d’avoir un échange entre développeur·ses pour discuter de la meilleure manière de faire.

## Prise en main d’un ticket

Pour chaque tâche sur le projet, un ticket doit être créé : **1 tâche = 1 ticket = 1 branche**.

Une fois le ticket créé, voici son parcours classique :

1. Assignation du ticket à la personne en charge et déplacement du ticket dans la colonne « En cours de dev » dans le kanban sur GitHub.
2. Création d’une branche avec le nom suggéré par GitHub (exemple : `1984-ajout-des-guidelines-techniques`) :

```sh
git branch 1984-ajout-des-guidelines-techniques
```

## Commit

Lors de la phase de développement, quelques règles sont essentielles pour faciliter la review, améliorer la cohérence et faciliter la gestion des conflits :

- **1 commit = 1 changement** : un commit ne doit pas s’éparpiller et ne doit concerner qu’un changement.
- **atomic commit** : le périmètre d’un commit doit rester petit.
- **rebase réglièrement** : pour éviter les trop gros conflits, il est important de _rebase_ régulièrement en rappatriant le code de la branche `main` dans la branche courante`.
- **titre du commit** : suivre la méthodologie [conventional commit](https://www.conventionalcommits.org) [⚠️ A CHALLENGER] en anglais. La règle est `<type de changement>: <description du changement>`, exemples :
  - `feat: add transfer modal`,
  - `fix: publication date update`,
  - `docs: update changelog`.

## Pull request

Une fois les développements terminés, une pull request (PR) peut être créée sur GitHub :

- Le nom de la PR doit reprendre le nom du ticket
- La description doit indiquer les éléments importants s’il y en a.
- Les personnes concernées doivent doivent être assignées pour review.

> [!WARNING]
> Avant de publier la PR et d’assigner les reviewers, il est important de s’assurer :
>
> - Que le code correspond bien au périmètre du ticket traité.
> - Que le code a été relu et que tout est propre et nettoyé (`TODO`, commentaires, `console.log()`...).
> - Que le code build, que le lint passe et que l’environnement de test est correctement déployé.

## Review et merge

- allers-retours reviewer/créateur

Lors de la review, il est préférable d’être exhaustif afin d’assurer une base de code propre et harmonieuse. Une fois les commentaires fait, indiquer le résultat de la reivew :

- "**Comment**" : indique qu’il y a des commentaites mais que la review n’est pas terminée.
- "**Approve**" : indique que la PR est prête à être mergée et qu’il n’y a aucun commentaire ou seulement des commentaires qui ne nécessitent pas de nouvelle review.
- "**Request changes**" : indique qu’il y a des commentaires qui bloquent le merge de la PR.

La résolution des commentaires se fait par les reviewers sur leurs commentaires s'iels pensent que le problème a été correctement corrigé.

Juste avant de merger, il est important, si nécessaire, de mettre à jour le fichier `CHANGELOG.md`.
