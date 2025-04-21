//
// Run this script to realign the title levels of every comments and notes in the datebase to only use level 4, 5 and 6
//

import { PrismaClient } from "@prisma/client";
import { chunk, uniqBy } from "lodash";

/**
 * Cleanup markdown title levels to be between level 4 and 6
 * @param markdown The markdown string to fix
 * @returns Fixed markdown string
 */
function realignCommentHeadings(markdown: string | null | undefined): string {
  if (!markdown) {
    return markdown;
  }

  const lines: [number, string][] = markdown.split("\n").map((l, i) => [i, l]);

  // Ignore code blocks for following heading level calculation
  // (in case of markdown in code block)
  const linesWithoutCodeBlocks: [number, string][] = [];
  let ignore = false;
  for (let i = 0; i < lines.length; i++) {
    const it = lines[i];
    if (it[1].startsWith("```") && !it[1].slice(3).endsWith("```")) {
      ignore = !ignore;
    }
    if (!ignore) {
      linesWithoutCodeBlocks.push([it[0], it[1].trim()]);
    }
  }

  const headingLines = linesWithoutCodeBlocks.filter(([, l]) =>
    /^#+ ./.test(l)
  );

  const linesWithLevels = headingLines.map(([i, l]) => ({
    index: i,
    line: l,
    level: l.split(" ").at(0).length
  }));

  const headingLevels = uniqBy(linesWithLevels, (it) => it.level).map(
    (it) => it.level
  );
  headingLevels.sort();

  for (let i = 0; i < headingLevels.length; i++) {
    const originalLevel = headingLevels[i];
    const newLevel = 4 + i;
    if (newLevel <= 6) {
      linesWithLevels
        .filter((it) => it.level === originalLevel)
        .forEach((it) => {
          it.line = it.line.replace(/^#+/, "#".repeat(newLevel));
        });
    } else {
      linesWithLevels
        .filter((it) => it.level === originalLevel)
        .forEach((it) => {
          it.line = it.line.replace(/^#+ /, "".repeat(newLevel));
        });
    }
  }

  linesWithLevels.forEach((it) => {
    lines[it.index][1] = it.line;
  });

  const result = lines.map(([, line]) => line).join("\n");

  return result;
}

function isMisaligned(markdown: string | null | undefined): boolean {
  if (!markdown) {
    return false;
  }

  const h1 = (markdown.match(/^# ./gm) || []).length;
  const h2 = (markdown.match(/^## ./gm) || []).length;
  const h3 = (markdown.match(/^### ./gm) || []).length;
  const h4 = (markdown.match(/^#### ./gm) || []).length;
  const h5 = (markdown.match(/^##### ./gm) || []).length;
  const h6 = (markdown.match(/^###### ./gm) || []).length;

  const counts = [h1, h2, h3, h4, h5, h6];

  return !(
    !counts[0] &&
    !counts[1] &&
    !counts[2] &&
    ((!counts[3] && !counts[4] && !counts[5]) ||
      (counts[3] && !counts[4] && !counts[5]) ||
      (counts[3] && counts[4] && !counts[5]) ||
      (counts[3] && counts[4] && counts[5]))
  );
}

async function main() {
  const prisma = new PrismaClient();

  console.log("Fetching results...");

  const rawResults = await prisma.criterionResult.findMany({
    where: {
      OR: [
        {
          compliantComment: {
            not: null
          }
        },
        {
          notCompliantComment: {
            not: null
          }
        },
        {
          notApplicableComment: {
            not: null
          }
        }
      ]
    },
    select: {
      id: true,
      compliantComment: true,
      notCompliantComment: true,
      notApplicableComment: true
    }
  });

  console.log(rawResults.length, "results to update");

  const migratedResults = rawResults
    // only keep results that need to be realigned
    .filter(
      (r) =>
        isMisaligned(r.compliantComment) ||
        isMisaligned(r.notCompliantComment) ||
        isMisaligned(r.notApplicableComment)
    )
    .map((r) => {
      return {
        id: r.id,
        compliantComment: realignCommentHeadings(r.compliantComment),
        notCompliantComment: realignCommentHeadings(r.notCompliantComment),
        notApplicableComment: realignCommentHeadings(r.notApplicableComment)
      };
    });

  console.log("🚀 ~ main ~ migratedResults:", migratedResults.length);

  const batches = chunk(migratedResults, 10);

  for (let i = 0; i < batches.length; i++) {
    console.log("Sending batch", i, "/", batches.length);
    const batch = batches[i];
    await prisma.$transaction(
      batch.map((result) =>
        prisma.criterionResult.update({
          where: { id: result.id },
          data: result
        })
      )
    );
  }

  console.log("Fetching notes...");

  const audits = await prisma.audit.findMany({
    where: {
      notes: {
        not: null
      }
    },
    select: {
      id: true,
      notes: true
    }
  });

  console.log(audits.length, "notes to update");

  const migratedAudits = audits
    // only keep notes that need to be realigned
    .filter((audit) => isMisaligned(audit.notes))
    .map((audit) => {
      return {
        id: audit.id,
        notes: realignCommentHeadings(audit.notes)
      };
    });

  for (let i = 0; i < migratedAudits.length; i++) {
    if (i % 1 === 0) {
      console.log("Sending audit update", i, "/", migratedAudits.length);
    }
    const migratedAudit = migratedAudits[i];
    await prisma.audit.update({
      where: { id: migratedAudit.id },
      data: migratedAudit
    });
  }
}

main();
