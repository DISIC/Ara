# Confiture API

## Requirements

- node
- yarn
- PostgreSQL database

## Configuration

The applicatoin requires the following environement variables.

**`DATABASE_URL`** : Connection URL for the postgre database.

**`MAILER_USER`**,
**`MAILER_PASSWORD`**,
**`MAILER_SMTP_HOST`**,
**`MAILER_SMTP_PORT`** and
**`MAILER_SMTP_SECURE`** : Email server configuration. For development purpose, you can create a debug email address at https://ethereal.email/.

**`FONT_BASE_URL`** : Base url of the client app. Used in mails. Defaults to `http://localhost:3000`.

Here's an example of a `.env` file.

```ini
DATABASE_URL="postgresql://db-user:db-password@localhost:5432/confiture-db"

MAILER_USER="username@ethereal.email"
MAILER_PASSWORD="password"
MAILER_SMTP_HOST="smtp.ethereal.email"
MAILER_SMTP_PORT=587
MAILER_SMTP_SECURE=false

FRONT_BASE_URL="http://example.com"
```

## How to run

```sh
# Install dependencies
yarn install

# Run database migrations
yarn migrate:dev

# Run development server
yarn start:dev
```
