import { defineStore } from "pinia";
import ky from "ky";
import { has, sample, setWith, unset } from "lodash-es";

import {
  CriteriumResult,
  CriteriumResultStatus,
  CriterionResultUserImpact,
  ExampleImage,
  TransverseCriteriumResult,
  isPerPageResult,
  isTransverseResult
} from "../types";
import { useAuditStore } from "./audit";
import { useFiltersStore } from "./filters";
import { CRITERIA_BY_AUDIT_TYPE } from "../criteria";

type PageId = number;
type TopicNumber = number;
type CriteriumNumber = number;

const getLastRequestTimestampStorageKey = (auditId: string) =>
  `confiture:lastRequestTimestamp:${auditId}`;

type TransverseData = {
  [key: TopicNumber]: {
    [key: CriteriumNumber]: TransverseCriteriumResult;
  };
};

type PerPagedata = {
  [key: PageId]: {
    [key: TopicNumber]: {
      [key: CriteriumNumber]: CriteriumResult;
    };
  };
};

interface ResultsStoreState {
  auditId: string | null;

  data: {
    transverse: TransverseData;
    perPage: PerPagedata;
  } | null;

  /**
   * Store the statuses history when using the "Topic not applicable"
   * switch in case of a misclick.
   */
  previousStatuses: {
    [key: PageId]: {
      [key: TopicNumber]: {
        [key: CriteriumNumber]: CriteriumResultStatus;
      };
    };
  };

  /**
   * Number of update requests actually loading.
   *
   * When 0, nothing is loading.
   * When 1 or more, there's something loading.
   */
  currentRequestCount: number;

  /**
   * Timestamp of the last moment `currentRequestCount` changed from a non-zero value to zero.
   */
  lastRequestSuccessEnd: number | null;
}

export const useResultsStore = defineStore("results", {
  state: (): ResultsStoreState => {
    return {
      auditId: null,
      data: null,
      previousStatuses: {},
      currentRequestCount: 0,
      lastRequestSuccessEnd: null
    };
  },

  getters: {
    /**
     * @returns A single criterium result if it is available, undefined otherwise.
     */
    getCriteriumResult() {
      return (pageId: number, topicNumber: number, criteriumNumber: number) => {
        if (
          !this.data ||
          !this.data.perPage[pageId] ||
          !this.data.perPage[pageId][topicNumber] ||
          !this.data.perPage[pageId][topicNumber][criteriumNumber]
        ) {
          return;
        }

        return this.data.perPage[pageId][topicNumber][criteriumNumber];
      };
    },

    getTransverseCriteriumResult() {
      return (topicNumber: number, criteriumNumber: number) => {
        return this.data?.transverse[topicNumber][criteriumNumber];
      };
    },

    /**
     * @returns A getter returning all the results concerning a particular topic on a particular audited page.
     *   If a result if "transverse", the transverse version of the result is returned, the "perPage" version otherwise
     */
    getTopicResults() {
      return (
        pageId: number,
        topicNumber: number
      ): (CriteriumResult | TransverseCriteriumResult)[] => {
        if (
          !this.data ||
          !this.data.perPage[pageId] ||
          !this.data.perPage[pageId][topicNumber]
        ) {
          return [];
        }

        const perPageResults = { ...this.data.perPage[pageId][topicNumber] };

        const transverseResults = {
          ...this.data.transverse[topicNumber]
        };

        return Object.values(perPageResults).map((r) =>
          transverseResults[r.criterium].transverse
            ? transverseResults[r.criterium]
            : r
        );
      };
    },

    /**
     * @returns Every results in a list. Or undefined if the data is not fetched yet.
     */
    allResults(): (CriteriumResult | TransverseCriteriumResult)[] | undefined {
      if (!this.data) {
        return;
      }
      const perPageResults = Object.values(this.data.perPage)
        .map((page) => Object.values(page).map((topic) => Object.values(topic)))
        .flat(2);

      // FIXME: are some transverse criteria duplicated here ?
      return perPageResults.map((r) =>
        this.data?.transverse[r.topic][r.criterium].transverse
          ? this.data?.transverse[r.topic][r.criterium]
          : r
      );
    },

    /**
     * @returns True when every criterium in the audit have been tested (status is different from NOT_TESTED)
     */
    everyCriteriumAreTested(): boolean {
      return (
        !this.allResults?.some(
          (r) => r.status === CriteriumResultStatus.NOT_TESTED
        ) ?? false
      );
    },

    testedCriteriumCount(): number | undefined {
      return this.allResults?.filter(
        (r) => r.status !== CriteriumResultStatus.NOT_TESTED
      ).length;
    },

    /**
     * @returns Number of pages in the audit
     */
    pagesCount(): number {
      return this.data ? Object.keys(this.data.perPage).length : 0;
    },

    isLoading(): boolean {
      return this.currentRequestCount > 0;
    },

    /**
     * Ratio of tested criteria over total number of criteria.
     *
     * `0.5` means half of the audit criteria have been tested.
     */
    auditProgress(): number {
      const auditStore = useAuditStore();

      if (!this.data || !auditStore.currentAudit) {
        return 0;
      }

      const criteriaNumbers =
        CRITERIA_BY_AUDIT_TYPE[auditStore.currentAudit?.auditType];

      const pagesIds = Object.keys(this.data.perPage).map(Number);

      const everyResultIds = pagesIds.flatMap((pageId) =>
        criteriaNumbers.map(({ criterium, topic }) => ({
          pageId,
          criterium,
          topic
        }))
      );

      const totalResultsCount = everyResultIds.length;
      const testedResultsCount = everyResultIds.filter(
        ({ criterium, pageId, topic }) =>
          this.getCriteriumStatus(pageId, topic, criterium) !==
          CriteriumResultStatus.NOT_TESTED
      ).length;

      return testedResultsCount / totalResultsCount;
    },

    getCriteriumStatus() {
      return (pageId: number, topicNumber: number, criteriumNumber: number) => {
        if (!this.data) {
          throw new Error("Cant get status of unfetched result");
        }
        const isTransverse = this.isCriteriumTransverse(
          topicNumber,
          criteriumNumber
        );
        if (isTransverse) {
          return this.data.transverse[topicNumber][criteriumNumber].status;
        } else {
          return this.data.perPage[pageId][topicNumber][criteriumNumber].status;
        }
      };
    },

    isCriteriumTransverse() {
      return (topicNumber: number, criteriumNumber: number) => {
        const transverseResult =
          this.data?.transverse[topicNumber][criteriumNumber];
        return transverseResult?.transverse ?? false;
      };
    },

    /**
     * Returns true if a criterium is evaluated (status other than NT) on any
     * page other than `exceptPage`.
     */
    isCriteriumEvaluatedAtLeastOnce() {
      return (
        topicNumber: number,
        criteriumNumber: number,
        exceptPageId: number
      ) => {
        if (!this.data) {
          throw new Error("Cant check unfetched results");
        }
        const perPageResults = Object.values(this.data.perPage).map(
          (o) => o[topicNumber][criteriumNumber]
        );
        return perPageResults.some(
          (result) =>
            result.pageId !== exceptPageId &&
            result.status !== CriteriumResultStatus.NOT_TESTED
        );
      };
    }
  },

  actions: {
    async fetchResults(uniqueId: string) {
      const response = (await ky
        .get(`/api/audits/${uniqueId}/results`)
        .json()) as {
        results: CriteriumResult[];
        transverseResults: TransverseCriteriumResult[];
      };

      const perPageData: PerPagedata = {};

      // Store standard results
      response.results.forEach((r) => {
        if (!(r.pageId in perPageData)) {
          perPageData[r.pageId] = {};
        }

        if (!(r.topic in perPageData[r.pageId])) {
          perPageData[r.pageId][r.topic] = {};
        }

        perPageData[r.pageId][r.topic][r.criterium] = r;
      });

      // Store transverse results
      const transverseData: TransverseData = {};
      response.transverseResults.forEach((r) => {
        if (!(r.topic in transverseData)) {
          transverseData[r.topic] = {};
        }

        transverseData[r.topic][r.criterium] = r;
      });

      const storageKey = getLastRequestTimestampStorageKey(uniqueId);
      this.lastRequestSuccessEnd =
        Number(localStorage.getItem(storageKey)) || null;

      this.auditId = uniqueId;
      this.data = {
        perPage: perPageData,
        transverse: transverseData
      };
    },

    async updateResults(
      uniqueId: string,
      updates: CriteriumResult[],
      transverseUpdates: TransverseCriteriumResult[] = []
    ) {
      if (!this.data) {
        return;
      }

      const previousResults: CriteriumResult[] = [];
      const previousTransverseResults: TransverseCriteriumResult[] = [];

      updates.forEach((update) => {
        previousResults.push(
          this.data!.perPage[update.pageId][update.topic][update.criterium]
        );

        // Update UI immediately, rollbacks later if update fails.
        this.data!.perPage[update.pageId][update.topic][update.criterium] =
          update;
      });

      transverseUpdates.forEach((update) => {
        previousTransverseResults.push(
          this.data!.transverse[update.topic][update.criterium]
        );

        // Update UI immediately, rollbacks later if update fails.
        this.data!.transverse[update.topic][update.criterium] = update;
      });

      // update the edition date of the local audit. It will not be the same
      // value as the one stored in the DB but it is close enough in our case
      const auditStore = useAuditStore();
      if (auditStore.currentAudit) {
        auditStore.currentAudit.editionDate = new Date().toISOString();
      }

      // update filter store to record evaluated criteria
      const filterStore = useFiltersStore();
      if (filterStore.hideEvaluatedCriteria) {
        filterStore.newEvaluatedCriteria = [
          ...new Set([
            ...filterStore.newEvaluatedCriteria,
            ...updates.map((u) => {
              return `${u.pageId}.${u.topic}.${u.criterium}`;
            })
          ])
        ];
      }

      // Called when update fails, and UI must rollback to the previous result states
      const rollbackResults = () => {
        previousResults.forEach((result) => {
          if (!this.data) {
            return;
          }
          this.data.perPage[result.pageId][result.topic][result.criterium] =
            result;
        });

        previousTransverseResults.forEach((result) => {
          if (!this.data) {
            return;
          }
          this.data.transverse[result.topic][result.criterium] = result;
        });
      };

      this.increaseCurrentRequestCount();

      await ky
        .patch(`/api/audits/${uniqueId}/results`, {
          json: {
            data: updates,
            transverseData: transverseUpdates
          }
        })
        .catch((err) => {
          rollbackResults();
          throw err;
        })
        .finally(() => {
          this.decreaseCurrentRequestCount();
        });
    },

    /**
     * Send a batch of updates to the API setting the status of every
     * criterium of a particular topic in a particular audited page to the
     * given value.
     *
     * Also save the current status values in order to revert the change if needed.
     */
    async setTopicStatus(
      uniqueId: string,
      pageId: number,
      topicNumber: number,
      status: CriteriumResultStatus
    ) {
      const results = this.getTopicResults(pageId, topicNumber);

      if (status === CriteriumResultStatus.NOT_APPLICABLE) {
        results.forEach((r) => {
          setWith(
            this.previousStatuses,
            [pageId, r.topic, r.criterium],
            r.status,
            Object
          );
        });
      }

      const updates = results.map((r) => ({
        ...r,
        status
      }));

      const perPageUpdates = updates.filter(isPerPageResult);
      const transverseUpdates = updates.filter(isTransverseResult);

      await this.updateResults(uniqueId, perPageUpdates, transverseUpdates);
    },

    /**
     * Send a batch of updates to the API setting the status of every
     * criterium of a particular topic in a particular audited page to the
     * values they had at the time of calling setTopicStatus().
     *
     * If there are no previous values saved, all statuses are set to NOT_TESTED.
     */
    async revertTopicStatus(
      uniqueId: string,
      pageId: number,
      topicNumber: number
    ) {
      if (has(this.previousStatuses, [pageId, topicNumber])) {
        const updates = Object.entries(
          this.previousStatuses[pageId][topicNumber]
        ).map(([criterium, status]) => {
          return {
            ...this.getCriteriumResult(pageId, topicNumber, Number(criterium))!,
            status
          };
        });
        await this.updateResults(uniqueId, updates);
        unset(this.previousStatuses, [pageId, topicNumber]);
      } else {
        await this.setTopicStatus(
          uniqueId,
          pageId,
          topicNumber,
          CriteriumResultStatus.NOT_TESTED
        );
      }
    },

    /** Mark a criterium as transverse, the status of the page result is applied to the transverse result. */
    updateResultIsTransverse(
      uniqueId: string,
      pageId: number,
      topic: number,
      criterium: number,
      isTransverse: boolean
    ) {
      console.log("updateResultIsTransverse", isTransverse);
      const transverseResult = this.data?.transverse[topic][criterium];
      const pageResult = this.data?.perPage[pageId][topic][criterium];

      if (!transverseResult || !pageResult) {
        throw new Error("Cannot update unfetched result");
      }

      const updatedTransverseResult: TransverseCriteriumResult = {
        ...transverseResult,
        transverse: isTransverse,
        // Apply the current status of the perPage result to the transverse one.
        status: isTransverse ? pageResult.status : transverseResult.status
      };
      return this.updateResults(uniqueId, [], [updatedTransverseResult]);
    },

    updateCriteriumStatus(
      uniqueId: string,
      pageId: number,
      topic: number,
      criterium: number,
      status: CriteriumResultStatus
    ) {
      if (this.isCriteriumTransverse(topic, criterium)) {
        // Update transverse result
        const result = this.data?.transverse[topic][criterium];
        if (!result) {
          throw new Error("Cannot update unfetched result");
        }
        return this.updateResults(uniqueId, [], [{ ...result, status }]);
      } else {
        // Update per page result
        const result = this.data?.perPage[pageId][topic][criterium];
        if (!result) {
          throw new Error("Cannot update unfetched result");
        }
        return this.updateResults(uniqueId, [{ ...result, status }], []);
      }
    },

    /**
    Set a transverse criterium as not-transverse and update its status for the given page.
    On the other pages, we "transfer" the props from the transverse criterium to the per page criteria.
    */
    async untransversifyCriterium(
      uniqueId: string,
      pageId: number,
      topic: number,
      criterium: number,
      status: CriteriumResultStatus
    ) {
      if (!this.data) {
        throw new Error("Cannot update unfetched results");
      }

      const perPageResults = Object.values(this.data.perPage).map(
        (p) => p[topic][criterium]
      );
      const transverseResult = this.data.transverse[topic][criterium];

      const transverseUpdate: TransverseCriteriumResult = {
        ...transverseResult,
        transverse: false
      };

      const perPageUpdates: CriteriumResult[] = perPageResults.map((r) => ({
        ...r,
        status: r.pageId === pageId ? status : transverseResult.status,
        errorDescription: (
          (r.errorDescription ?? "") +
          "\n\n" +
          (transverseResult.errorDescription ?? "")
        ).trim(),
        compliantComment:
          (r.compliantComment ?? "") +
          "\n\n" +
          (transverseResult.compliantComment ?? ""),
        notApplicableComment:
          (r.notApplicableComment ?? "") +
          "\n\n" +
          (transverseResult.notApplicableComment ?? ""),
        recommandation:
          (r.recommandation ?? "") +
          "\n\n" +
          (transverseResult.recommandation ?? "")
        // TODO: what to do with quickwin, userImpact
      }));

      return this.updateResults(uniqueId, perPageUpdates, [transverseUpdate]);
    },

    /**
     * @param pageId Id of the criterium page. If null, the image is associated with the transverse criterium
     */
    async uploadExampleImage(
      uniqueId: string,
      pageId: number | null,
      topic: number,
      criterium: number,
      file: File
    ) {
      const formData = new FormData();
      pageId !== null && formData.set("pageId", pageId.toString());
      formData.set("topic", topic.toString());
      formData.set("criterium", criterium.toString());
      // To handle non-ascii characters, we encode the filename here and decode it on the back
      formData.set("image", file, encodeURI(file.name));

      this.increaseCurrentRequestCount();

      const exampleImage = (await ky
        .post(`/api/audits/${uniqueId}/results/examples`, {
          body: formData
        })
        .json()
        .finally(() => {
          this.decreaseCurrentRequestCount();
        })) as ExampleImage;

      if (pageId !== null) {
        const result = this.data!.perPage[pageId][topic][criterium];
        if (result) {
          result.exampleImages.push(exampleImage);
        }
      } else {
        const transverseResult = this.data?.transverse[topic][criterium];
        if (transverseResult) {
          transverseResult.exampleImages.push(exampleImage);
        }
      }
    },

    async deleteExampleImage(
      uniqueId: string,
      pageId: number | null,
      topic: number,
      criterium: number,
      exampleId: number
    ) {
      this.increaseCurrentRequestCount();

      await ky
        .delete(`/api/audits/${uniqueId}/results/examples/${exampleId}`)
        .finally(() => {
          this.decreaseCurrentRequestCount();
        });

      const result =
        pageId !== null
          ? this.data?.perPage[pageId][topic][criterium]
          : this.data?.transverse[topic][criterium];

      if (result) {
        const exampleIndex = result.exampleImages.findIndex(
          (ex) => ex.id === exampleId
        );

        result.exampleImages.splice(exampleIndex, 1);
      }
    },

    increaseCurrentRequestCount() {
      this.currentRequestCount++;
    },

    /**
     * When `currentRequestCount` changes from a non-zero value to zero, save a timestamp to the store and localstorage
     */
    decreaseCurrentRequestCount() {
      this.currentRequestCount--;

      if (this.currentRequestCount === 0) {
        this.lastRequestSuccessEnd = Date.now();
        const key = getLastRequestTimestampStorageKey(this.auditId!);
        localStorage.setItem(key, this.lastRequestSuccessEnd.toString());
      }
    },

    /**
     * Fill the entire audit with random values for debugging purpose.
     */
    async DEV_fillResults(uniqueId: string) {
      const auditStore = useAuditStore();
      const updates =
        (this.allResults?.map((r) => ({
          ...r,
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          status: sample([
            CriteriumResultStatus.COMPLIANT,
            CriteriumResultStatus.NOT_COMPLIANT,
            CriteriumResultStatus.NOT_APPLICABLE
          ])!,
          compliantComment: sample(["Commentaire conforme", "Rien"])!,
          errorDescription: sample(["Commentaire non conforme", "Rien"])!,
          notApplicableComment: sample(["Commentaire non-applicable", "Rien"])!,
          recommandation: sample(["Recommandation", "Rien"])!,
          userImpact: sample(CriterionResultUserImpact)!
          /* eslint-enable @typescript-eslint/no-non-null-assertion */
        })) as (CriteriumResult | TransverseCriteriumResult)[]) ?? [];

      const perPageUpdates = updates.filter(isPerPageResult);
      const transverseUpdates = updates.filter(isTransverseResult);

      await this.updateResults(uniqueId, perPageUpdates, transverseUpdates);
      await auditStore.publishAudit(uniqueId);
    }
  }
});
