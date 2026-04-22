import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getRawAccounts, rawAudits, rawCriteria } from "./seed-data";
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

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function generateSeeds() {
  if (!process.env.DATABASE_SEEDS) {
    console.log("Nothing to seeds");
    return;
  };

  const rawAccounts = await getRawAccounts();

  await prisma.$transaction(async (tx) => {
    const accounts = await Promise.all(rawAccounts.map(async rawAcc => {
      const data = {
        username: rawAcc.email,
        password: rawAcc.password,
        isVerified: true,
        verificationJti: null
      };

      return await tx.user.upsert({
        where: {
          username: rawAcc.email
        },
        create: data,
        update: data
      });
    }));

    const audits = await Promise.all(accounts.flatMap((acc, i) => {
      return rawAudits.map(rawAudit => {
        // Example key: "0-full-pending-with-statement"
        const uniqueKey = `${i}-${rawAudit.auditType.toLowerCase()}-${rawAudit.publicationDate ? "pending" : "completed"}${rawAudit.statementPublicationDate ? "-with-statement" : ""}`;
        const editUniqueId = `edit-${uniqueKey}`;
        const reportUniqueId = `report-${uniqueKey}`;

        const data = {
          ...rawAudit,
          editUniqueId,
          consultUniqueId: reportUniqueId,
          auditorEmail: acc.username,
          auditTrace: {
            connectOrCreate: {
              where: {
                auditEditUniqueId: editUniqueId
              },
              create: {
                auditEditUniqueId: editUniqueId,
                auditConsultUniqueId: reportUniqueId
              }
            }
          },
          pages: rawAudit.pages
            ? {
                createMany: {
                  data: rawAudit.pages.createMany.data,
                  skipDuplicates: true
                }
              }
            : undefined,
          environments: rawAudit.environments
            ? {
                createMany: {
                  data: rawAudit.environments.createMany.data,
                  skipDuplicates: true
                }
              }
            : undefined
        };

        const { pages, transverseElementsPage, environments, auditTrace, ...updateData } = data;

        return tx.audit.upsert({
          where: {
            editUniqueId
          },
          create: { isHidden: false, ...data },
          update: { isHidden: false, ...updateData },
          select: {
            publicationDate: true,
            transverseElementsPage: true,
            pages: true
          }
        });
      });
    }));

    // Fill results for completed audits
    const completedAudits = audits.filter(a => a.publicationDate);

    await Promise.all(completedAudits.flatMap(audit => {
      return [audit.transverseElementsPage, ...audit.pages].map(p => {
        return tx.criterionResult.createMany({
          data: rawCriteria.map(c => {
            return {
              ...c,
              pageId: p.id
            };
          }),
          skipDuplicates: true
        });
      });
    }));
  }, {
    timeout: 20_000
  });

  console.log(`Seeded ${rawAccounts.length} accounts with ${rawAudits.length} audits each.`);
}

generateSeeds();
