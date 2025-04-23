import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginUnusedImport from "eslint-plugin-unused-imports";
import eslintPluginVue from "eslint-plugin-vue";
import globals from "globals";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  { ignores: ["*.d.ts", "**/coverage", "**/dist", "public"] },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs["flat/recommended"]
    ],
    files: ["**/*.{ts,vue,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser
      }
    },
    plugins: {
      "simple-import-sort": eslintPluginSimpleImportSort,
      "unused-imports": eslintPluginUnusedImport
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error"
    }
  },
  eslintConfigPrettier
);
