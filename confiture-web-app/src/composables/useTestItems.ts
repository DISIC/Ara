import { computed, ref, Ref, shallowRef, ShallowRef, watchEffect } from "vue";
import { api } from "../api";
import { TestItem, CreateTestItem, UpdateTestItem } from "../types/api";

type ItemId = string;

type UseTestItemsKey = [
  auditId: ShallowRef<string>,
  pageSlug: ShallowRef<string>,
  criterium: ShallowRef<string>
];

interface UseTestItemsOptions {
  onDeleted?: (deletedItem: TestItem) => void;
  onCreated?: (createdItem: TestItem) => void;
  confirmDelete?: boolean;
}

interface UseTestItemReturn {
  isLoading: ShallowRef<boolean>;
  data: Ref<TestItem[] | null>;
  create(data?: CreateTestItem): Promise<TestItem>;
  update(id: ItemId, data: UpdateTestItem): Promise<TestItem>;
  delete(id: ItemId): Promise<TestItem>;
}

/*
TODO:
- error handling
- debounced updates
*/
export function useTestItems(key: UseTestItemsKey, options?: UseTestItemsOptions): UseTestItemReturn {
  const isLoading = shallowRef(true);
  const data = ref<TestItem[] | null>(null);

  const resourceUrl = computed(() => {
    const [auditId, pageSlug, criterium] = key;
    return `/api/audits/${auditId.value}/pages/${pageSlug.value}/criteria/${criterium.value}/testItems`;
  });

  // fetch data and refetch on key changes
  watchEffect(async () => {
    isLoading.value = true;
    data.value = null;
    data.value = await api.get(resourceUrl.value).json<TestItem[]>();
    isLoading.value = false;
  });

  async function create(payload?: CreateTestItem) {
    const createdItem = await api.post(resourceUrl.value, { json: payload })
      .json<TestItem>();

    data.value?.push(createdItem);

    if (options?.onCreated) options.onCreated(createdItem);

    return createdItem;
  }

  async function update(id: ItemId, payload: UpdateTestItem) {
    const updatedItem = await api.patch(`${resourceUrl.value}/${id}`, { json: payload })
      .json<TestItem>();

    const idx = data.value?.findIndex(it => it.id === id) ?? -1;
    if (idx !== -1) data.value?.splice(idx, 1, updatedItem);

    return updatedItem;
  }

  async function deleteItem(id: ItemId) {
    const deletedItem = await api.delete(`${resourceUrl.value}/${id}`)
      .json<TestItem>();

    const idx = data.value?.findIndex(it => it.id === id) ?? -1;
    if (idx !== -1) data.value?.splice(idx, 1);

    if (options?.onDeleted) options.onDeleted(deletedItem);

    return deletedItem;
  }

  return {
    isLoading,
    data,
    create,
    update,
    delete: deleteItem
  };
}

// const useResults = createResourceComposable({ /* ... */ })
// const usePages = createResourceComposable({ /* ... */ })
// const useTestItems = createResourceComposable({ /* ... */ })
