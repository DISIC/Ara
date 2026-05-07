import { NestFactory } from "@nestjs/core";
import dotenv from "dotenv";
import { AppModule } from "../src/app.module";
import { AuditService } from "../src/audits/audit.service";
import { PrismaService } from "../src/prisma.service";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // get service instances configured by the nest framework
  const prisma = app.get(PrismaService);
  const auditService = app.get(AuditService);

  // find audits without a publication date
  const audits = await prisma.audit.findMany({
    where: {
      publicationDate: null
    },
    select: { editUniqueId: true, publicationDate: true, creationDate: true, procedureName: true },
  });

  console.log(`Found ${audits.length} potential complete audits with no publication`);

  // filter audits looking for the ones that are complete (every criteria checked on every page)
  const completeChecks = await Promise.all(audits.map(a => auditService.isAuditComplete(a.editUniqueId)));
  const completeAudits = audits.filter((_, i) => completeChecks[i]);

  console.log(`Found ${completeAudits.length} complete audits without publication date`);

  // set publication date to be creation date
  for (const a of completeAudits) {
    process.stdout.write(`Updating audit ${a.editUniqueId}`);
    await prisma.audit.update({
      where: { editUniqueId: a.editUniqueId },
      data: { publicationDate: a.creationDate }
    });
    console.log(" ✅");
  }

  console.log("✨ Done ! ✨");

  await app.close();
}
bootstrap();
