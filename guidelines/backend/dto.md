TODO:

- routes qui renvoient différentes réponses pour une meme ressource: dto spécifiques (ex : `UpdateResourceResponse`, `GetResourceResponseDto`)

# DTO

Un DTO précise la liste des propriétés d’une entité ou d’une requête d’API.

- Les fichiers de DTO sont rangés dans un dossier `dto` au sein de chaque dossier de ressource : `audits/dto`.
- Si une entité possède une propriété qui est un tableau ou un objet et qui doit être validé, il faut soit importer le type correspondant, soit directement le déclarer dans le DTO avec une classe :
- Par soucis de lisibilité, on on saute une ligne entre deux propriétés d’un DTO.

  ```ts
  import { CreatePageRequestDto } from '...'
  class PageElements {
    @IsBoolean()
    multimedia: boolean;

    @IsBoolean()
    form: boolean;

    @IsBoolean()
    table: boolean;

    @IsBoolean()
    frame: boolean;
  }

  export class CreateAuditRequestDto {
    ...

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePageRequestDto)
    pages?: CreatePageRequestDto[];

    @IsObject()
    @ValidateNested()
    @Type(() => PageElements)
    pageElements: PageElements;
  }
  ```

- Il existe 2 types de DTO : de requête et de réponse.

## DTO de requête

- Ils ont la forme `<verbe>-<ressource>-request.dto.ts`.
- Chaque propriété est typée (`@IsString()`, `@IsEmail()`...).
- Exemple : `update-audit-request.dto.ts`

```typescript
import { IsString } from "class-validator";

export class UpdateAuditRequestDto {
  @IsString()
  procedureName?: string;
}
```

## DTO de réponse

- Ils ont la forme `<ressource>-response.dto.ts`.
- Chaque propriété possède le décorateur `@Expose()` afin d'en valider le type (cf. controlleur).
- Il n’est pas nécessaire de préciser le type avec un décorateur (`@IsString()`...).
- Dans le cas d’une propriété qui est basée sur un type avec plusieurs propriétés, il est requis d’ajouter le décorateur `@Type()` et d’avoir `@Expose()` sur les sous-propriétés.

```typescript
import { Expose, Type } from "class-transformer";

export class AuditResponseDto {
  @Expose()
  editUniqueId: string;

  @Expose()
  procedureName: string;

  @Expose()
  @Type(() => PageDto)
  pages: PageDto[];
}

class PageDto {
  @Expose()
  name: string;

  @Expose()
  url: string;
}
```

## Propriété `null`, `undefined` ou les deux

- Une propriété "effacable" (= peut être `null`) est indiquée avec `procedureName: string | null` ainsi qu’avec le décorateur `@IsNullable()` (dans le cas des DTO de requête).
- Une propriété optionnelle (= peut être `undefined`) est indiquée avec `procedureName?: string` ainsi qu’avec le décorateur `@IsUndefinable()` (dans le cas des DTO de requête).
- Une propriété à la fois "effaçable" et optionnelle est indiquée avec `procedureName?: string | null` ainsi qu’avec le décorateur `@IsOptional()` (dans le cas des DTO de requête).

```ts
export class ExampleDto {
  // Propriété "effaçable"
  @IsString()
  @IsNullable()
  procedureName: string | null;

  // Propriété "optionnelle"
  @IsString()
  @IsUndefinable()
  procedureName?: string;

  // Propriété "effaçable" et optionnelle
  @IsString()
  @IsOptional()
  procedureName?: string | null;
}
```
