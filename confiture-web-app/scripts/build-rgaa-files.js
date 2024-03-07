/**
 * This scripts generates a file containing every RGAA tests methodology based
 * on the https://github.com/DISIC/accessibilite.numerique.gouv.fr repository.
 *
 * The result file uses the JSON format and contains a mapping of test ids
 * (ex: "1.2.3") with the associated methodology in Markdown.
 */

/* eslint-disable */
const child_process = require("node:child_process");
const util = require("node:util");
const path = require("path");
const fs = require("fs").promises;

const exec = util.promisify(child_process.exec);

async function cloneRgaaRepository() {
  await exec("rm -rf accessibilite.numerique.gouv.fr");
  await exec(
    "git clone https://github.com/DISIC/accessibilite.numerique.gouv.fr"
  );
}

async function generateMethodologies() {
  const METHODOLOGIES_SOURCE = path.join(
    __dirname,
    "..",
    "./accessibilite.numerique.gouv.fr/RGAA/methodologies.json"
  );

  const METHODOLOGIES_DESTINATION = path.join(
    __dirname,
    "..",
    "./src/methodologies.json"
  );

  await fs.copyFile(METHODOLOGIES_SOURCE, METHODOLOGIES_DESTINATION);
}

async function generateCriteria() {
  const CRITERIA_SOURCE = path.join(
    __dirname,
    "..",
    "./accessibilite.numerique.gouv.fr/RGAA/criteres.json"
  );

  const CRITERIA_DESTINATION = path.join(
    __dirname,
    "..",
    "./src/criteres.json"
  );

  await fs.copyFile(CRITERIA_SOURCE, CRITERIA_DESTINATION);
}

(async function main() {
  await cloneRgaaRepository();
  await generateMethodologies();
  await generateCriteria();
})();
