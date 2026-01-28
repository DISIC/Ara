/**
 * TODO:
 * ✅ format and save to localStorage
 * ✅ individually toggle topic with dedicated button
 * - when creating an audit, set the value of the statuses (/!\ step 3)
 * - toggle topic with "Not applicable for page" button
 * - handle add / delete page
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

  function retrieveFromLocalStorage() {
    const data = localStorage.getItem(localStorageKey);

    if (data) {
      const parsedData = JSON.parse(data);

      auditStore.topicAccordionsStatuses = parsedData;
    }

    return;
  }

  function saveToLocalStorage() {
    const stringifiedData = JSON.stringify(auditStore.topicAccordionsStatuses);

    localStorage.setItem(localStorageKey, stringifiedData);
  }

  function toggleTopicAccordionStatus(
    auditEditId: string,
    pageId: number,
    topicNumber: number,
    status: boolean
  ) {
    if (auditStore.topicAccordionsStatuses) {
      setWith(auditStore.topicAccordionsStatuses, `${auditEditId}.${pageId}.${topicNumber}`, status, Object);
      saveToLocalStorage();
    }
  }

  return {
    retrieveFromLocalStorage,
    saveToLocalStorage,
    toggleTopicAccordionStatus
  };
}
