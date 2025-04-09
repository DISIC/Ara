import { PrismaClient } from "@prisma/client";
import { readFile, writeFile } from "fs";
import { chunk, uniqBy } from "lodash";
import { resolve } from "path";

// TODO: document/comment
function realignCommentHeadings(markdown: string | null | undefined): string {
  if (!markdown) {
    return markdown;
  }

  const lines: [number, string][] = markdown.split("\n").map((l, i) => [i, l]);

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

  // console.log("🚀 ~ realignCommentHeadings ~ headingLines:", headingLines);

  const linesWithLevels = headingLines.map(([i, l]) => ({
    index: i,
    line: l,
    level: l.split(" ").at(0).length
  }));

  // console.log("🚀 ~ linesWithLevels ~ linesWithLevels:", linesWithLevels);

  const headingLevels = uniqBy(linesWithLevels, (it) => it.level).map(
    (it) => it.level
  );
  headingLevels.sort();
  console.log("🚀 ~ headingLevels ~ levels:", headingLevels);

  for (let i = 0; i < headingLevels.length; i++) {
    const originalLevel = headingLevels[i];
    const newLevel = 4 + i;
    if (newLevel <= 6) {
      // console.log(`Transforming h${originalLevel} into h${newLevel}`);
      linesWithLevels
        .filter((it) => it.level === originalLevel)
        .forEach((it) => {
          it.line = it.line.replace(/^#+/, "#".repeat(newLevel));
        });
    } else {
      // console.log(`Transforming h${originalLevel} into paragraph`);
      linesWithLevels
        .filter((it) => it.level === originalLevel)
        .forEach((it) => {
          it.line = it.line.replace(/^#+ /, "".repeat(newLevel));
        });
    }
  }
  // console.log("🚀 ~ linesWithLevels ~ linesWithLevels:", linesWithLevels);

  linesWithLevels.forEach((it) => {
    lines[it.index][1] = it.line;
  });

  const result = lines.map(([, line]) => line).join("\n");

  return result;
}

/**
 * - aligner les titres au niveau le plus haut (h4, h5, h6)
 * - les titres qui dépassent deviennent des paragraphes
 * - si des niveaux de titres sont sautés, on réaligne mais on essaie pas de combler
 */
async function main() {
  // TODO: try to instanciate multiple PrismaClient to use parallel DB connections
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
    // take: 500
  });

  console.log(rawResults.length, "results to update");

  const migratedResults = rawResults.map((r) => {
    return {
      id: r.id,
      compliantComment: realignCommentHeadings(r.compliantComment),
      notCompliantComment: realignCommentHeadings(r.notCompliantComment),
      notApplicableComment: realignCommentHeadings(r.notApplicableComment)
    };
  });

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

  const migratedAudits = audits.map((audit) => {
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

// readFile(
//   resolve(__dirname, "9132.md"),
//   { encoding: "utf-8" },
//   (err, markdown) => {
//     const fixed = realignCommentHeadings(markdown);
//     // console.log(fixed);
//     writeFile(
//       resolve(__dirname, "9132-fix.md"),
//       fixed,
//       { encoding: "utf-8" },
//       () => {
//         console.log("pouet");
//       }
//     );
//   }
// );
