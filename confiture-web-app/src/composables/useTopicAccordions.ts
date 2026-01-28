/**
 * TODO:
 * ✅ format and save to localStorage
 * ✅ individually toggle topic with dedicated button
 * ✅ when creating an audit, set the value of the statuses (/!\ step 3)
 * ✅ toggle topic with "Not applicable for page" button
 * ✅ sync with localStorage
 * ✅ remove old `hiddenTopics`
 * - handle priorities (not applicable on page, localStorage...)
 * - handle add / delete page (is it required?)
 * - e2e tests (existing + new?)
 * - function names?
 */

import { setWith } from "lodash-es";
import { useAuditStore } from "../store";

export interface topicAccordionsStatuses {
  [auditId: string]: {
    [pageId: number]: {
      [topicNumber: number]: boolean;
    };
  };
}

const localStorageKey = "ara:hidden-topics";

export function useTopicAccordions() {
  const auditStore = useAuditStore();

  /** Synchronise Pinia store with localStorage if any */
  function retrieveTopicAccordionStatusesFromLocalStorage() {
    const data = localStorage.getItem(localStorageKey);

    if (data) {
      const parsedData = JSON.parse(data);

      auditStore.topicAccordionsStatuses = parsedData;
    }

    return;
  }

  /** Synchronise localStorage with Pinia store */
  function saveTopicAccordionStatusToLocalStorage() {
    const stringifiedData = JSON.stringify(auditStore.topicAccordionsStatuses);

    localStorage.setItem(localStorageKey, stringifiedData);
  }

  /** Toggle topic status for a specific audit, page and topic */
  function toggleTopicAccordionStatus(
    auditEditId: string,
    pageId: number,
    topicNumber: number,
    status: boolean
  ) {
    setWith(auditStore.topicAccordionsStatuses, `${auditEditId}.${pageId}.${topicNumber}`, status, Object);
  }

  /** Check topic status (`true` if hidden) */
  function topicIsHidden(auditEditId: string, pageId: number, topic: number) {
    return auditStore.topicAccordionsStatuses[auditEditId]?.[pageId]?.[topic];
  }

  return {
    retrieveTopicAccordionStatusesFromLocalStorage,
    saveTopicAccordionStatusToLocalStorage,
    toggleTopicAccordionStatus,
    topicIsHidden
  };
}
