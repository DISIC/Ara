TODO:
- quand utiliser les events ? entre modules différents ? entre scopes différents (audit <-> auth) ?
- typer les paylaods d'events ?

# Événements

Les événements permettent de communiquer entre plusieurs modules ou de déclencher des mécanique comme l'envoi d'emails.

- La liste des événéments est enregistrée dans une enum qui permet de :
  - Contraindre le nom de l’événement (exemple : `"audit.craeted"` ne fonctionnera pas).
  - Typer automatiquement le payload requis par l’événement.
  ```ts
  // TODO: update snippet
  export enum EVENTS {
    AUDIT_CREATED = 'audit.created',
    AUDIT_TRANSFERED = 'audit.transfered',
  }
  ```

## Émettre un événement

- C'est le service qui envoie les événements, pas le controlleur.
- L'émetteur envoi dans tous les cas l'événement mais c'est le receveur qui va choisir quoi faire selon le contexte : est-ce que c'est un audit 106 ? est-ce que l'utilisateur est connecté ?...
- Le nommage des événements suit le schéma suivant : `ressource.action` : `audit.created`, `account.deleted`, `page.updated`...
- Le payload des événements comporte la ressource de l'événement en question.
  - Exemple : pour `account.deleted`, on renvoit le compte concerné.
- Pour envoyer un événément, on utilise `this.eventEmitter.emit()` avec le nom de l'événement et le payload :
  ```ts
  // depuis audits.service.ts
  this.eventEmitter.emit(EVENTS.AUDIT_CREATED, audit);
  ```
- utiliser une énum pour lister les événements

## Recevoir un événement

- Pour reçevoir un événement, on utilise `@OnEvent("audit.created")` :
  ```ts
  @OnEvent("audit.created")
  sendAuditCreatedMail(audit: Pick<Audit, "editUniqueId" | "consultUniqueId" | "procedureName" | "auditType" | "auditorEmail">) {
    ...
  }
  ```

- créer une méthode dédiée car :
  - ptete pas les mêmes paralètres
  - reprendre une autre méthode

- typer l'event emitter pour les paylods et noms d'events
