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
  const METHODOLOGY_SOURCE = path.join(
    __dirname,
    "..",
    "./accessibilite.numerique.gouv.fr/src/rgaa/criteres"
  );
  const METHODOLOGY_DESTINATION = path.join(
    __dirname,
    "..",
    "./src/methodologies.json"
  );

  const testsData = [];

  const criteriumFolders = await fs.readdir(METHODOLOGY_SOURCE);

  for (const criteriumFolder of criteriumFolders) {
    const testFiles = await fs.readdir(
      path.join(METHODOLOGY_SOURCE, criteriumFolder, "/tests")
    );

    for (const testFile of testFiles) {
      const data = await fs.readFile(
        path.join(METHODOLOGY_SOURCE, criteriumFolder, "/tests", testFile),
        "utf-8"
      );
      const markdown = data.split("---")[2].trimStart();

      const key = `${criteriumFolder}.${testFile.split(".")[0]}`;

      testsData.push({ key, markdown });
    }
  }

  testsData.sort((a, b) => {
    const [topicA, criteriumA, testA] = a.key.split(".").map(Number);
    const [topicB, criteriumB, testB] = b.key.split(".").map(Number);

    if (topicA !== topicB) {
      return topicA - topicB;
    }

    if (criteriumA !== criteriumB) {
      return criteriumA - criteriumB;
    }

    if (testA !== testB) {
      return testA - testB;
    }

    return 0;
  });

  const jsonData = testsData.reduce((acc, value) => {
    acc[value.key] = value.markdown;
    return acc;
  }, {});

  await fs.writeFile(
    METHODOLOGY_DESTINATION,
    JSON.stringify(jsonData, null, 2)
  );
}

async function generateGlossary() {
  const GLOSSARY_SOURCE = path.join(
    __dirname,
    "..",
    "./accessibilite.numerique.gouv.fr/RGAA/4.1/glossaire.json"
  );

  const GLOSSARY_DESTINATION = path.join(
    __dirname,
    "..",
    "./src/glossaire.json"
  );

  await fs.copyFile(GLOSSARY_SOURCE, GLOSSARY_DESTINATION);
}

async function generateCriteria() {
  const CRITERIA_SOURCE = path.join(
    __dirname,
    "..",
    "./accessibilite.numerique.gouv.fr/RGAA/4.1/criteres.json"
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
  await generateGlossary();
  await generateCriteria();
})();
