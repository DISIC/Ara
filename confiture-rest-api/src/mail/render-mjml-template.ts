import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import Handlebars from "handlebars";
import mjml2html from "mjml";

/**
 * @param templateName Name of the MJML template to be compiled
 * @param data Variables to be included in the email
 * @returns A string of HTML
 */
export function renderMailTemplate(
  templateName: string,
  data: Record<string, any>
): string {
  const mjmlPath = resolve(__dirname, `../../templates/${templateName}.mjml`);
  const mjml = readFileSync(mjmlPath, "utf-8");
  const result = mjml2html(mjml, {
    filePath: mjmlPath,
    preprocessors: [
      (xml) => {
        const hbarsTemplate = Handlebars.compile(xml);
        const compiledTemplate = hbarsTemplate(data);
        return compiledTemplate;
      }
    ]
  });

  return result.html;
}
