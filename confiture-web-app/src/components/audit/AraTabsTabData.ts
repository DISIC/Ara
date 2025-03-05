import { type Component } from "vue";

import { slugify } from "../../utils";

export class AraTabsTabData {
  label: string;
  #slug: string; // do not allow slug to be defined from outside
  icon: Component | undefined;
  component: Component;
  componentParams: object | undefined;

  constructor(data: {
    label: string;
    icon?: Component;
    component: Component;
    componentParams?: object;
  }) {
    const label = data.label;
    this.label = label;
    this.#slug = slugify(label);
    this.icon = data.icon;
    this.component = data.component;
    this.componentParams = data.componentParams;
  }

  // TODO: check how to expose "slug" to DevTools
  // Currently it is not exposed because #slug is private
  public get slug(): string {
    return this.#slug;
  }
}
