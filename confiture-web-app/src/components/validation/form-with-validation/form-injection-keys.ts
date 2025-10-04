import { InjectionKey } from "vue";
import { ValidatedField } from "../../../composables/validation";

export const addFieldKey = Symbol("addField") as InjectionKey<(field: ValidatedField) => void>;
export const removeFieldKey = Symbol("removeField") as InjectionKey<(field: ValidatedField) => void>;
