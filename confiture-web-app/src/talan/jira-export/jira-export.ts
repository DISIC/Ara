import slugify from "slugify";
import rgaa from "../../criteres.json";

/**
 * Talan customisation (see CUSTOMISATIONS_TALAN.md).
 *
 * Export of the audit errors as a CSV file importable in Jira Cloud
 * (Jira settings > System > External System Import > CSV).
 *
 * One ticket per error (`NotCompliantItem`), plus one ticket per not compliant
 * criterion without any error, so that nothing is lost.
 *
 * This module is self-contained on purpose: it only depends on the generated
 * RGAA file and on its own local types, so that DISIC upstream changes
 * (types, utils, criteria) do not conflict with it.
 */

/* Local structural types: the audit and results store objects match them. */

interface ExportedPage {
  id: number;
  name: string;
  url: string;
}

export interface ExportedAudit {
  id: number;
  consultUniqueId: string;
  procedureName: string;
  auditType: string;
  auditorName: string | null;
  transverseElementsPage: ExportedPage;
  pages: ExportedPage[];
  environments: {
    platform: string;
    operatingSystem: string;
    assistiveTechnology: string;
    browser: string;
  }[];
}

interface ExportedItem {
  title?: string | null;
  comment: string | null;
  userImpact: string | null;
  quickWin: boolean | null;
}

interface ExportedResult {
  topic: number;
  criterium: number;
  status: string;
  exampleImages: { key: string }[];
  notCompliantItems: ExportedItem[];
}

export type ExportedResults = Record<number, Record<number, Record<number, ExportedResult>>>;

interface JiraTicket {
  summary: string;
  priority: string;
  description: string;
  environment: string;
  labels: string[];
  pageName: string;
  pageUrl: string;
  criterion: string;
  criterionTitle: string;
  topic: string;
  wcag: string;
  userImpact: string;
  quickWin: string;
  audit: string;
  reportUrl: string;
}

const SUMMARY_MAX_LENGTH = 255;

const JIRA_PRIORITY: Record<string, string> = {
  BLOCKING: "Highest",
  MAJOR: "High",
  MINOR: "Low"
};

const USER_IMPACT_LABEL: Record<string, string> = {
  BLOCKING: "Bloquant",
  MAJOR: "Majeur",
  MINOR: "Mineur"
};

const AUDIT_TYPE_LABEL: Record<string, string> = {
  FAST: "audit rapide, 25 critères",
  COMPLEMENTARY: "audit complémentaire, 50 critères",
  FULL: "audit complet, 106 critères"
};

interface ErrorToExport {
  page: ExportedPage;
  result: ExportedResult;
  item: ExportedItem | null;
}

/** Lists the errors to export, in audit order (pages, then criteria). */
function getErrorsToExport(audit: ExportedAudit, results: ExportedResults | null): ErrorToExport[] {
  if (!results) {
    return [];
  }

  const pages = [audit.transverseElementsPage, ...audit.pages];

  return pages.flatMap((page) =>
    rgaa.topics.flatMap((topic) => topic.criteria.flatMap(({ criterium }): ErrorToExport[] => {
      const result = results[page.id]?.[topic.number]?.[criterium.number];

      if (result?.status !== "NOT_COMPLIANT") {
        return [];
      }

      return result.notCompliantItems.length
        ? result.notCompliantItems.map((item) => ({ page, result, item }))
        : [{ page, result, item: null }];
    }))
  );
}

/** Returns the number of tickets that would be exported. */
export function getJiraTicketsCount(audit: ExportedAudit, results: ExportedResults | null): number {
  return getErrorsToExport(audit, results).length;
}

/** Returns the Jira tickets to export. */
export function getJiraTickets(
  audit: ExportedAudit,
  results: ExportedResults | null,
  origin: string
): JiraTicket[] {
  return getErrorsToExport(audit, results).map(({ page, result, item }) =>
    getTicket(audit, page, result, item, origin)
  );
}

/**
 * Builds the CSV file content: UTF-8 with BOM (so that Excel does not display
 * garbled accents), comma separated, all values quoted.
 */
export function generateJiraCsv(tickets: JiraTicket[]): string {
  const labelColumnsCount = Math.max(1, ...tickets.map((t) => t.labels.length));

  const header = [
    "Summary",
    "Issue Type",
    "Priority",
    "Description",
    "Environment",
    ...Array.from({ length: labelColumnsCount }, () => "Labels"),
    "Page",
    "URL de la page",
    "Critère RGAA",
    "Intitulé du critère",
    "Thématique",
    "Critères WCAG",
    "Impact usager",
    "Quick win",
    "Audit",
    "Lien rapport Ara"
  ];

  const rows = tickets.map((t) => [
    t.summary,
    "Bug",
    t.priority,
    t.description,
    t.environment,
    ...Array.from({ length: labelColumnsCount }, (_, i) => t.labels[i] ?? ""),
    t.pageName,
    t.pageUrl,
    t.criterion,
    t.criterionTitle,
    t.topic,
    t.wcag,
    t.userImpact,
    t.quickWin,
    t.audit,
    t.reportUrl
  ]);

  return "\uFEFF" + [header, ...rows]
    .map((row) => row.map((value) => `"${value.replaceAll("\"", "\"\"")}"`).join(","))
    .join("\r\n");
}

/** Generates the CSV and triggers its download in the browser. */
export function downloadJiraCsv(audit: ExportedAudit, results: ExportedResults | null) {
  const csv = generateJiraCsv(getJiraTickets(audit, results, window.location.origin));
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));

  const link = document.createElement("a");
  link.href = url;
  link.download = getJiraCsvFilename(audit);
  link.click();

  URL.revokeObjectURL(url);
}

function getJiraCsvFilename(audit: ExportedAudit): string {
  return `tickets-jira-${slugify(audit.procedureName, { lower: true, strict: true })}.csv`;
}

function getTicket(
  audit: ExportedAudit,
  page: ExportedPage,
  result: ExportedResult,
  item: ExportedItem | null,
  origin: string
): JiraTicket {
  const topic = rgaa.topics.find((t) => t.number === result.topic)!;
  const criterium = topic.criteria.find((c) => c.criterium.number === result.criterium)!.criterium;

  const criterionNumber = `${result.topic}.${result.criterium}`;
  const criterionTitle = markdownToText(criterium.title);
  const wcag = criterium.references.find((r) => "wcag" in r)?.wcag ?? [];
  const isTransverse = page.id === audit.transverseElementsPage.id;
  const pageName = isTransverse ? "Éléments transverses" : page.name;
  const userImpact = item?.userImpact ? USER_IMPACT_LABEL[item.userImpact] ?? "" : "";
  const quickWin = item?.quickWin ? "Oui" : "Non";
  const auditLabel = `${audit.procedureName} (${AUDIT_TYPE_LABEL[audit.auditType] ?? audit.auditType})`;
  const reportUrl = `${origin}/rapport/${audit.consultUniqueId}/`;
  const environment = audit.environments
    .map((e) => [e.platform, e.operatingSystem, e.assistiveTechnology, e.browser].filter(Boolean).join(" · "))
    .join("\n");

  const title = item?.title?.trim() || criterionTitle;
  const summary = truncate(`[RGAA ${criterionNumber}] ${title} (${pageName})`, SUMMARY_MAX_LENGTH);

  const labels = [
    "RGAA",
    `RGAA-${criterionNumber}`,
    `RGAA-thematique-${result.topic}`,
    userImpact ? `impact-${slugify(userImpact, { lower: true, strict: true })}` : null,
    item?.quickWin ? "quick-win" : null,
    isTransverse ? "element-transverse" : null,
    `ara-audit-${audit.id}`
  ].filter((l): l is string => !!l);

  const images = [
    ...(item?.comment ? getTiptapImages(item.comment) : []),
    ...(item ? [] : result.exampleImages.map((i) => `/uploads/${i.key}`))
  ].map((src) => encodeURI(decodeURI(src.startsWith("/") ? origin + src : src)));

  const contextRows: [string, string][] = [
    ["Page", pageName],
    ["URL", isTransverse ? "" : page.url],
    ["Critère RGAA", `${criterionNumber} : ${criterionTitle}`],
    ["Thématique", `${topic.number}. ${topic.topic}`],
    ["WCAG", wcag.join(", ")],
    ["Impact usager", userImpact || "Non renseigné"],
    ["Quick win", quickWin],
    ["Audit", auditLabel],
    ["Auditeur", audit.auditorName ?? ""],
    ["Rapport Ara", reportUrl]
  ];

  const description = [
    "h3. Anomalie",
    item?.comment ? commentToWiki(item.comment) : "Aucune description saisie dans Ara.",
    "",
    "h3. Contexte",
    ...contextRows
      .filter(([, value]) => value)
      .map(([label, value]) => `||${label}|${/^https?:\/\//.test(value) ? value : escapeWiki(value)}|`),
    "",
    "h3. Tests RGAA du critère",
    ...Object.entries(criterium.tests).flatMap(([testNumber, lines]) => {
      const [question, ...conditions] = lines as string[];
      return [
        `# ${criterionNumber}.${testNumber} ${markdownToWiki(question)}`,
        ...conditions.map((c) => `## ${markdownToWiki(c)}`)
      ];
    }),
    ...(images.length
      ? ["", "h3. Captures", ...images.map((src) => `* [${src}]`)]
      : [])
  ].join("\n");

  return {
    summary,
    priority: (item?.userImpact && JIRA_PRIORITY[item.userImpact]) || "Medium",
    description,
    environment,
    labels,
    pageName,
    pageUrl: isTransverse ? "" : page.url,
    criterion: criterionNumber,
    criterionTitle,
    topic: `${topic.number}. ${topic.topic}`,
    wcag: wcag.join(", "),
    userImpact,
    quickWin,
    audit: auditLabel,
    reportUrl
  };
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength - 1) + "…" : value;
}

/** Escapes characters that have a meaning in Jira wiki markup. */
function escapeWiki(value: string): string {
  return value.replace(/[{}[\]|!*_^~+\\]/g, (c) => `\\${c}`);
}

/** RGAA markdown (glossary links, inline code) to plain text. */
function markdownToText(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

/** RGAA markdown (glossary links, inline code) to Jira wiki markup. */
function markdownToWiki(value: string): string {
  return value
    .split(/(`[^`]+`)/)
    .map((part) =>
      part.startsWith("`") && part.endsWith("`") && part.length > 1
        ? `{{${part.slice(1, -1)}}}`
        : escapeWiki(part.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"))
    )
    .join("");
}

interface TiptapNode {
  type: string;
  text?: string;
  attrs?: Record<string, any>;
  marks?: { type: string; attrs?: Record<string, any> }[];
  content?: TiptapNode[];
}

function parseTiptap(comment: string): TiptapNode | null {
  try {
    const doc = JSON.parse(comment);
    return doc?.type === "doc" ? doc : null;
  } catch {
    // Not JSON: legacy markdown comment
    return null;
  }
}

function getTiptapImages(comment: string): string[] {
  const images: string[] = [];
  const visit = (node: TiptapNode) => {
    if (node.type === "image" && node.attrs?.src) {
      images.push(node.attrs.src);
    }
    node.content?.forEach(visit);
  };

  const doc = parseTiptap(comment);
  if (doc) {
    visit(doc);
  }
  return images;
}

/** Converts an error comment (Tiptap JSON or legacy markdown) to Jira wiki markup. */
function commentToWiki(comment: string): string {
  const doc = parseTiptap(comment);
  if (!doc) {
    return comment;
  }
  return blocksToWiki(doc.content ?? [], "").trim();
}

function blocksToWiki(nodes: TiptapNode[], listPrefix: string): string {
  return nodes
    .map((node) => blockToWiki(node, listPrefix))
    .filter((block) => block !== "")
    .join("\n\n");
}

function blockToWiki(node: TiptapNode, listPrefix: string): string {
  const content = node.content ?? [];

  switch (node.type) {
    case "paragraph":
      return inlineToWiki(content);
    case "heading":
      return `h${Math.min(Math.max(node.attrs?.level ?? 3, 1), 6)}. ${inlineToWiki(content)}`;
    case "bulletList":
    case "orderedList": {
      const prefix = listPrefix + (node.type === "bulletList" ? "*" : "#");
      return content
        .map((listItem) =>
          (listItem.content ?? [])
            .map((child, i) =>
              child.type === "bulletList" || child.type === "orderedList"
                ? blockToWiki(child, prefix)
                : (i === 0 ? `${prefix} ` : "") + blockToWiki(child, prefix)
            )
            .join("\n")
        )
        .join("\n");
    }
    case "blockquote":
      return `{quote}\n${blocksToWiki(content, "")}\n{quote}`;
    case "codeBlock": {
      const language = node.attrs?.language ? `:${node.attrs.language}` : "";
      return `{code${language}}\n${content.map((c) => c.text ?? "").join("")}\n{code}`;
    }
    case "horizontalRule":
      return "----";
    case "image":
      return `(capture : ${node.attrs?.alt || "image"})`;
    default:
      return content.length ? blocksToWiki(content, listPrefix) : inlineToWiki([node]);
  }
}

function inlineToWiki(nodes: TiptapNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "hardBreak") {
        return "\n";
      }
      if (node.type === "image") {
        return `(capture : ${node.attrs?.alt || "image"})`;
      }
      if (node.type !== "text" || !node.text) {
        return "";
      }

      const marks = node.marks ?? [];
      if (marks.some((m) => m.type === "code")) {
        return `{{${node.text}}}`;
      }

      let text = escapeWiki(node.text);
      for (const mark of marks) {
        if (mark.type === "bold") text = `*${text}*`;
        if (mark.type === "italic") text = `_${text}_`;
        if (mark.type === "strike") text = `-${text}-`;
        if (mark.type === "underline") text = `+${text}+`;
        if (mark.type === "link" && mark.attrs?.href) text = `[${text}|${mark.attrs.href}]`;
      }
      return text;
    })
    .join("");
}
