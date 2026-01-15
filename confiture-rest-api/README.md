# Back-end Ara

Le projet est une API [Nest.js](https://nestjs.com/) et utilise une base de données [PostgreSQL](https://www.postgresql.org/) avec [Prisma](https://www.prisma.io/).

## Installation du backend

> [!NOTE]
> Si vous avez lancé `yarn install` à la racine du projet, les dépendances ont déjà été installées.

Installer les dépendances :

```sh
yarn install
```

> [!IMPORTANT]
> Les étapes suivantes sont à faire dans tous les cas.

Créer le fichier de variables d’environnement :

```sh
cp .env.example .env
```

Remplir les variables d’environnement requises dans le `.env` :

- `MAILER_USER` et `MAILER_PASSWORD` peuvent être générées via [https://ethereal.email/](https://ethereal.email/) en cliquant sur "Create Ethereal account".
- `GRIST_*`, `S3_*` et `AWS_*` doivent être demandées en privé.
- `JWT_SECRET` peut être laissé à sa valeur par défaut.

Lancer la base de données :

```sh
docker run --name confiture-db \
           --env POSTGRES_USER=db-user \
           --env POSTGRES_PASSWORD=db-password \
           --publish 127.0.0.1:5432:5432 \
           --detach \
             postgres:14
```

Lancer les migrations de la base de données :

```sh
yarn migrate:dev
```

## Développement

Lancer le serveur local :

```sh
yarn start:dev
```

> [!TIP]
> On peut aussi utiliser
>
> ```sh
> yarn dev:back
> ```
>
> depuis la racine du projet.

La documentation de l’API est disponible sur Swagger (requiert d’avoir lancé le serveur local) : [http://localhost:4000/swagger](http://localhost:4000/swagger)
