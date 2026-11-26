# Contrôleurs

Le contrôleur liste les routes d’API pour une ressource, vérifie les autorisations et appelle le service correspondant. Il est important de ne pas surcharger la liste de ses responsabilités pour garder une structure simple.

## Structure du fichier

- Le contrôleur possède les décorateurs suivants pour valider le typage des réponses des routes (quand nécessaire) :
  - `@UseInterceptors(ClassSerializerInterceptor)`
  - `@SerializeOptions({ type: AuditResponseDto, excludeExtraneousValues: true })`
  ```ts
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: AuditResponseDto, excludeExtraneousValues: true })
  @Controller("/audits")
  export class AuditsController { ... }
  ```
- L’ordre des méthodes est le suivant : méthodes du CRUD suivies des méthodes d‘action (s’il y en a, spécifiques à chaque ressource). Le nom de la fonction reprend le nom de la méthode (exemple : pour le Create du CRUD, on nomme la fonction `createAudit`, `createStatement`...).

  ```ts
  export class AuditsController {
    constructor() {}

    //
    // CRUD methods
    //

    @Post()
    async createAudit() {}

    @Get()
    async getAudits() {}

    @Get(":uniqueId")
    async getAudit() {}

    @Patch(":uniqueId")
    async updateAudit() {}

    @Delete(":uniqueId")
    async deleteAudit() {}

    //
    // Action methods
    //

    @Post(":uniqueId/transfer")
    async transferAudit() {}

    @Post(":uniqueId/duplicate")
    async duplicateAudit() {}
  }
  ```

## Route d’API

- Chaque retour de route est typé (exemples : `Promise<AuditResponseDto>` ou `Promise<void>`).
- Chaque paramètre est correctement typé. Dans le cas de validation complexe de paramètres de route, il est possible de créer un fichier spécifique. Exemple : `@Param() params: UpdateResultParams` où `params` représente la liste des paramètres et `UpdateResultParams` est une classe issue d’un fichier séparé.
- Pour une route qui accepte un payload, on nomme `body` ce dernier et on le type avec le DTO correspondant.
- Dans le cas où le body est un tableau d’éléments, on utilise `ParseArrayPipe()` pour valider les éléments : `@Body(new ParseArrayPipe({ items: UpdateResultsRequestDto })) body: UpdateResultsRequestDto[]`.
- Pour une route qui vérifie l’utilisateur, on nomme `@CurrentUser()` le décorateur correspondant (pour éviter un conflit de nommage avec l’entité `User` de Prisma) et `user` la variable.
- Lorsqu’il est nécessaire, on vérifie les permissions de l’utilisateur avant d’appeler le service, avec le `authorisationService` :
  - On créé une permission dans le fichier de policy correspondant (`AuditPolicy`, `PagePolicy`...).
  - On importe le `authorizationService` dans le constructeur du controlleur.
  - On utilise la méthode `authorize` avec les paramètres requis, ce qui renvoie un boolean donnant le droit ou non à l’utilisateur de procéder à l’action.
  ```ts
  await this.authorizationService.authorize(AuditPolicy, "update", user);
  ```

Exemple de route complète :

```ts
@Patch(":uniqueId")
  async updateAudit(
    @Param("uniqueId") uniqueId: string,
    @CurrentUser() user: User,
    @Body() body: UpdateAuditRequestDto
  ): Promise<AuditResponseDto> {
    await this.authorizationService.authorize(AuditPolicy, "update", user);
    return this.auditsService.updateAudit(uniqueId, body);
  }
```
