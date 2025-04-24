/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, any>;
  export default component;
}

// Allow importing DOCX files
declare module "*.docx";

declare module "*.md";
