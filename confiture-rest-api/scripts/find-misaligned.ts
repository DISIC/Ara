import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  const rawResults = await prisma.criterionResult.findMany({
    select: {
      id: true,
      compliantComment: true,
      notCompliantComment: true,
      notApplicableComment: true
    }
  });

  const notes = await prisma.audit.findMany({
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

  const comments = [
    ...rawResults.flatMap((r) => [
      { comment: r.compliantComment, id: `result:${r.id}` },
      { comment: r.notApplicableComment, id: `result:${r.id}` },
      { comment: r.notCompliantComment, id: `result:${r.id}` }
    ]),
    ...notes.map((n) => {
      return { comment: n.notes, id: `note:${n.id}` };
    })
  ].filter((it) => it.comment);

  console.log(comments.length, "comments/notes");

  // [0, 2, 1,]

  const titleCounts = comments.map((r) => {
    const h1 = (r.comment.match(/^# ./gm) || []).length;
    const h2 = (r.comment.match(/^## ./gm) || []).length;
    const h3 = (r.comment.match(/^### ./gm) || []).length;
    const h4 = (r.comment.match(/^#### ./gm) || []).length;
    const h5 = (r.comment.match(/^##### ./gm) || []).length;
    const h6 = (r.comment.match(/^###### ./gm) || []).length;

    return {
      ...r,
      counts: [h1, h2, h3, h4, h5, h6]
    };
  });

  const misaligned = titleCounts.filter((c) => {
    const counts = c.counts;
    // return counts[3];
    return !(
      !counts[0] &&
      !counts[1] &&
      !counts[2] &&
      ((!counts[3] && !counts[4] && !counts[5]) ||
        (counts[3] && !counts[4] && !counts[5]) ||
        (counts[3] && counts[4] && !counts[5]) ||
        (counts[3] && counts[4] && counts[5]))
    );
  });
  console.log("misaligned", misaligned.length);
  console.log(
    "🚀 ~ misaligned ~ misaligned:",
    misaligned.map((it) => it.counts)
  );
  console.log(
    "🚀 ~ misaligned ~ misaligned:",
    misaligned.map((it) => it.id)
  );
}

main();
