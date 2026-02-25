import { setWith } from "lodash-es";
import { useAuditStore } from "../store";

export interface topicAccordionsStatus {
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
  function retrieveStatusFromLocalStorage() {
    const data = localStorage.getItem(localStorageKey);

    if (data) {
      const parsedData = JSON.parse(data);

      auditStore.topicAccordionsStatus = parsedData;
    }

    return;
  }

  /** Synchronise localStorage with Pinia store */
  function saveStatusToLocalStorage() {
    const stringifiedData = JSON.stringify(auditStore.topicAccordionsStatus);

    localStorage.setItem(localStorageKey, stringifiedData);
  }

  /** Toggle topic status for a specific audit, page and topic */
  function toggleStatus(
    auditEditId: string,
    pageId: number,
    topicNumber: number,
    status: boolean
  ) {
    setWith(auditStore.topicAccordionsStatus, `${auditEditId}.${pageId}.${topicNumber}`, status, Object);
  }

  /** Check topic status (`true` if hidden) */
  function isTopicHidden(auditEditId: string, pageId: number, topic: number) {
    return auditStore.topicAccordionsStatus[auditEditId]?.[pageId]?.[topic];
  }

  return {
    retrieveStatusFromLocalStorage,
    saveStatusToLocalStorage,
    toggleStatus,
    isTopicHidden
  };
}
