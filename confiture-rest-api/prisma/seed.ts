import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const urlBuilder = new URL(process.env.DATABASE_URL);
const hasSsl = Boolean(process.env.DATABASE_SSL);

if (!hasSsl) {
  urlBuilder.searchParams.set("sslmode", "require");
  urlBuilder.searchParams.set("uselibpqcompat", "true");
} else {
  urlBuilder.searchParams.delete("sslmode");
  urlBuilder.searchParams.delete("uselibpqcompat");
}

const url = urlBuilder.toString();
console.log(url);

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function generateAccounts() {
  const emails = [
    "adrien.muzyczka.ext@numerique.gouv.fr",
    "adrien@slash-tmp.dev",
    "benoit.dequick@numerique.gouv.fr",
    "emmanuelle.aboaf@shodo.io",
    "quentin+ara@slash-tmp.dev",
    "yaacov.cohen.ext@numerique.gouv.fr"
  ];
  const password = await hash("pouetpouetpouet", 10);

  await prisma.$transaction(emails.map(email => {
    const data = {
      username: email,
      password: password,
      isVerified: true,
      verificationJti: null
    };

    return prisma.user.upsert({
      where: {
        username: email
      },
      create: data,
      update: data
    });
  }));
}

generateAccounts();
