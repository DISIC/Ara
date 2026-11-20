# Autorisations et permissions

Tous les utilisateurs n’ont pas les mêmes droits selon la ressource, le statut etc. Avant de procéder à une action, il est important de vérifier les permissions que possède l’utilisateur courant. La gestion de ces permission est faite avec [Nest Authorization](https://docs.nestjs.com/security/authorization).

## Déclaration des permissions

- Lorsqu’une ressource a besoin de permissions, il faut créer un fichier de policy : `audit.policy.ts` puis l’importer dans les providers du module de la ressource :
  ```ts
  @Module({
    controllers: [AuditsController],
    providers: [AuditsService, AuditPolicy]
  })
  export class AuditsModule {}
  ```
- Le fichier de policy liste un ensemble de règles pour certaines actions (`read`, `update`, `transfer`...) sous forme de fonctions qui renvoient un boolean : `true` si l’utilisateur a le droit de faire l’action, `false` sinon.
- La policy doit avoir le décorateur `@Policy()` pour être déclarée en tant que telle.
- Cette fonction prend a minima l’utilisateur courant (`user`) en argument. Il est possible de lui en passer d’autre (exemple : `auditUniqueId`).

```ts
@Policy()
export class AuditPolicy {
  constructor() {}

  create(): boolean {
    return true;
  }

  async delete(user: User | null, auditUniqueId: string): Promise<boolean> {
    const audit = await this.getAudit(auditUniqueId);
  
    if (isAuditInAccount(audit)) {
      return isUserAuditOwner(user, audit);
    } else {
      return true;
    }
  }
}
```

## Utilisation des permissions

- Chaque appel à une route d’API va être soumis à une permission du fichier de policy dans le contrôleur. Même si une route est en accès public, il faut créer une policy qui renvoie explicitement `true`.
- Il faut importer le `authorizationService` dans le contrôleur et vérifier les permissions dès la première ligne de la fonction avec la méthode `authorize()`.
- Si l’utilisateur a la permission, la suite de la méthode s’exécute. Sinon, la méthode renvoie une erreur HTTP 401 "Unauthorized" ou 403 "Forbidden".

```ts
@Delete(":uniqueId")
async deleteAudit(@Param("uniqueId") uniqueId: string, @CurrentUser() user: User | null): Promise<void> {
  await this.authorizationService.authorize(AuditPolicy, "delete", user, uniqueId);
  await this.auditsService.softDeleteAudit(uniqueId);
}
```
