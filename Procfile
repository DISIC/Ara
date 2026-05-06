web: node confiture-rest-api/dist/main.js
postdeploy: yarn workspace confiture-rest-api run prisma migrate deploy && yarn workspace confiture-rest-api run db:seed
