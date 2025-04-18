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

  // const containsH6 = titleCounts.filter((counts) => counts[5]).length;
  // console.log("🚀 ~ main ~ containsH6:", containsH6);

  // let skip = 0;
  // const tooMuchIndex = titleCounts.findIndex((counts) => {
  //   const usedLevelsCount = counts.filter((c) => c !== 0).length;
  //   return usedLevelsCount > 3 && skip-- === 0;
  // });

  // console.log(comments.at(tooMuchIndex));

  const tooMuchHeadings = titleCounts.filter((counts) => {
    const usedLevelsCount = counts.counts.filter((c) => c !== 0).length;
    return usedLevelsCount > 3;
  });
  console.log(
    "🚀 ~ tooMuchHeadings ~ tooMuchHeadings:",
    tooMuchHeadings.map((it) => it.counts)
  );
  console.log(
    "🚀 ~ tooMuchHeadings ~ tooMuchHeadings:",
    tooMuchHeadings.map((it) => it.id)
  );

  // const usedLevelsCounts = titleCounts.map(
  //   (counts) => counts.counts.filter((c) => c !== 0).length
  // );
  // console.log("🚀 ~ main ~ usedLevelsCounts:", usedLevelsCounts);

  // console.log(countBy(usedLevelsCounts));

  // const commentsWithGap = titleCounts.filter((counts) => {
  //   let foundNotZeroOnce = false;
  //   let foundPotentialGapZero = false;
  //   for (let i = 0; i < counts.counts.length; i++) {
  //     const c = counts[i];
  //     if (c !== 0 && !foundNotZeroOnce) {
  //       foundNotZeroOnce = true;
  //     } else if (foundNotZeroOnce && c === 0) {
  //       foundPotentialGapZero = true;
  //     } else if (foundPotentialGapZero && c !== 0) {
  //       return true;
  //     }
  //   }

  //   return false;
  // });
  // console.log(
  //   "🚀 ~ commentsWithGap ~ commentsWithGap:",
  //   commentsWithGap,
  //   commentsWithGap.length
  // );
}

main();
