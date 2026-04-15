INSERT INTO "NotCompliantItem"("criterionResultId", "comment", "userImpact", "quickWin")
select "id", "errorDescription", "userImpact", "quickWin"
from "CriterionResult"
where 
  "status" = 'NOT_COMPLIANT'
AND ("userImpact" is not null
OR "errorDescription" is not null
OR  "quickWin" = true)