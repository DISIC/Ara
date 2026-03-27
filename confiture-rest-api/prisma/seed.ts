import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcrypt";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
// FIXME: fix ts issue
// @ts-ignore
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function generateAccounts() {
  const emails = [
    "adrien.muzyczka@modernisation.gouv.fr",
    "adrien@slash-tmp.dev",
    "benoit.dequick@modernisation.gouv.fr",
    "emmanuelle.aboaf@shodo.io",
    "quentin+ara@slash-tmp.dev",
    "yaacov.cohen@prestataire.modernisation.gouv.fr"
  ];
  const password = await hash("pouetpouetpouet", 10);

  await prisma.$transaction(emails.map(email => {
    return prisma.user.create({
      data: {
        username: email,
        password: password,
        isVerified: true,
        verificationJti: null
      }
    });
  }));
}

generateAccounts();
