import { Ref, ShallowRef } from "vue";
import { TestItem, CreateTestItem, UpdateTestItem } from "../types/api";

type ItemId = string;

type UseTestItemsKey = [auditId: string, pageSlug: string, criterium: string];

interface UseTestItemsOptions {
  onDeleted(deletedItem: TestItem): void;
  onCreated(createdItem: TestItem): void;
}

interface UseTestItemReturn {
  isLoading: ShallowRef<boolean>;
  data: Ref<TestItem[] | null>;
  create(data?: CreateTestItem): Promise<TestItem>;
  update(id: ItemId, data: UpdateTestItem): Promise<TestItem>;
  delete(id: ItemId): Promise<TestItem>;
}

export function useTestItems(key: UseTestItemsKey, options?: UseTestItemsOptions): UseTestItemReturn {
  throw new Error("todo");
}
