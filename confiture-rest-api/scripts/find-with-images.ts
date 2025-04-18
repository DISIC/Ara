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

  const withMarkdownImages = comments.filter(
    (it) => it.comment.match(/!\[.*\]\(.+\)/)?.at(0)
  );

  console.log("with markdown image", withMarkdownImages.length);

  console.log(withMarkdownImages.map((it) => it.id));
}

main();
