import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import cypress from "eslint-plugin-cypress/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImport from "eslint-plugin-unused-imports";
import vue from "eslint-plugin-vue";
import globals from "globals";
import ts from "typescript-eslint";

export default ts.config([
  globalIgnores(["*.d.ts", "**/coverage", "**/dist", "public"]),
  {
    name: "ara/common",
    extends: [js.configs.recommended, ts.configs.recommended],
    files: ["**/*.{ts,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        parser: ts.parser
      }
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImport
    },
    rules: {
      // typescript rules:
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",

      // avoid duplicate stuff
      "no-duplicate-imports": "error",

      // sort imports & exports
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // avoid unused stuff
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ]
    }
  },
  {
    name: "ara/rest-api",
    ignores: ["confiture-rest-api/src/generated"]
  },
  {
    name: "ara/web-app",
    extends: [vue.configs["flat/recommended"]],
    files: ["confiture-web-app/**/*.{ts,vue,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        parser: ts.parser
      },
      sourceType: "module"
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off"
    }
  },
  {
    name: "ara/cypress",
    extends: [cypress.configs.recommended],
    files: ["cypress/**/*.ts"]
  },
  prettier
]);
