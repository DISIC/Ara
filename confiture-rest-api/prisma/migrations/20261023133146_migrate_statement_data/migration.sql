-- create a A11Statement for each audit with existing statement
INSERT INTO
  "A11yStatement" (
    "auditId",
    "initiator",
    "auditorOrganisation",
    "procedureUrl",
    "contactEmail",
    "contactFormUrl",
    "technologies",
    "tools",
    "notCompliantContent",
    "derogatedContent",
    "notInScopeContent",
    "statementPublicationDate",
    "statementEditionDate",
    "schemaPluriannuelUrl",
    "planActionUrl"
  )
SELECT
  "id",
  "initiator",
  "auditorOrganisation",
  "procedureUrl",
  "contactEmail",
  "contactFormUrl",
  "technologies",
  "tools",
  "notCompliantContent",
  "derogatedContent",
  "notInScopeContent",
  "statementPublicationDate",
  "statementEditionDate",
  "schemaPluriannuelUrl",
  "planActionUrl"
FROM
  "Audit"
WHERE
  "initiator" IS NOT NULL;

-- update TestEnvironment rows to include a11yStatementId
UPDATE "TestEnvironment" AS t
SET
  "a11yStatementId" = (
    SELECT
      s."id"
    FROM
      "A11yStatement" AS s
      RIGHT JOIN "Audit" AS a ON a."id" = s."auditId"
    WHERE
      t."auditUniqueId" = a."editUniqueId"
  );
