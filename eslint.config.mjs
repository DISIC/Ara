import antfu from "@antfu/eslint-config";

export default antfu({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ["*.{md,js,json,mjs,ts,yml}"]
      }
    }
  },

  imports: {
    overrides: {
      "import/consistent-type-specifier-style": "off" // TODO Check this rule
    }
  },

  javascript: {
    overrides: {
      "dot-notation": "off", // TODO Check this rule
      "eqeqeq": "off", // TODO Check this rule
      "import/consistent-type-specifier-style": "off", // TODO Check this rule
      "no-irregular-whitespace": "off",
      "no-throw-literal": "off", // TODO Check this rule
      "no-undef-init": "off", // TODO Check this rule
      "no-unneeded-ternary": "off", // TODO Check this rule
      "no-useless-return": "off", // TODO Check this rule
      "object-shorthand": "off", // TODO Check this rule
      "prefer-arrow-callback": "off", // TODO Check this rule
      "prefer-exponentiation-operator": "off", // TODO Check this rule
      "prefer-promise-reject-errors": "off", // TODO Check this rule
      "prefer-template": "off", // TODO Check this rule
      "unused-imports/no-unused-vars": "off" // TODO Check this rule
    }
  },

  jsonc: {
    overrides: {
      "jsonc/sort-keys": "off" // TODO Check this rule
    }
  },

  // Customize the stylistic rules
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: true,
    overrides: {
      "antfu/consistent-chaining": "off", // TODO Check this rule
      "antfu/if-newline": "off", // TODO Check this rule
      "unicorn/prefer-node-protocol": "off", // TODO Check this rule
      "antfu/top-level-function": "off", // TODO Check this rule
      "jsdoc/check-alignment": "off", // TODO Check this rule
      "node/prefer-global/process": "off", // TODO Check this rule
      "style/arrow-parens": "off",
      "style/indent-binary-ops": "off", // TODO Check this rule
      "style/brace-style": "off", // TODO Check this rule
      "style/comma-dangle": ["error", "never"], // TODO Check this rule
      "style/lines-between-class-members": "off", // TODO Check this rule
      "style/operator-linebreak": "off", // TODO Check this rule
      "style/function-call-spacing": "error"
    }
  },

  typescript: {
    overrides: {
      "node/prefer-global/buffer": "off", // TODO Check this rule
      "perfectionist/sort-named-imports": "off", // TODO Check this rule
      "ts/ban-ts-comment": "off", // TODO Check this rule
      "ts/consistent-type-definitions": "off", // TODO Check this rule
      "ts/consistent-type-imports": "off", // TODO Check this rule
      "ts/method-signature-style": "off", // TODO Check this rule
      "ts/no-empty-object-type": "off", // TODO Check this rule
      "ts/no-namespace": "off", // TODO Check this rule
      "ts/no-unused-expressions": "off", // TODO Check this rule
      "ts/no-use-before-define": "off", // TODO Check this rule
      "unicorn/prefer-number-properties": "off" // TODO Check this rule
    },
    overridesTypeAware: {
      "ts/dot-notation": "off", // TODO Check this rule
      "ts/no-floating-promises": "off", // TODO Check this rule
      "ts/no-misused-call": "off", // TODO Check this rule
      "ts/no-misused-promises": "off", // TODO Check this rule
      "ts/no-unnecessary-type-assertion": "off", // TODO Check this rule
      "ts/no-unsafe-argument": "off", // TODO Check this rule
      "ts/no-unsafe-assignment": "off", // TODO Check this rule
      "ts/no-unsafe-call": "off", // TODO Check this rule
      "ts/no-unsafe-member-access": "off", // TODO Check this rule
      "ts/no-unsafe-return": "off", // TODO Check this rule
      "ts/promise-function-async": "off", // TODO Check this rule
      "ts/return-await": "off", // TODO Check this rule
      "ts/strict-boolean-expressions": "off", // TODO Check this rule
      "ts/unbound-method": "off" // TODO Check this rule
    },
    // Enable type aware rules
    tsconfigPath: "tsconfig.json"
  },

  vue: {
    overrides: {
      "vue/block-tag-newline": ["error", {
        singleline: "never",
        multiline: "always",
        maxEmptyLines: 0,
        blocks: {
          template: {
            singleline: "always",
            multiline: "always",
            maxEmptyLines: 0
          },
          script: {
            singleline: "always",
            multiline: "always",
            maxEmptyLines: 0
          },
          style: {
            singleline: "always",
            multiline: "always",
            maxEmptyLines: 0
          }
        }
      }],
      "vue/comma-dangle": ["error", "never"],
      "vue/component-name-in-template-casing": "off", // TODO Check this rule
      "vue/custom-event-name-casing": "off", // TODO Check this rule
      "vue/define-macros-order": "off", // TODO Check this rule
      "vue/html-closing-bracket-newline": ["error"],
      "vue/html-indent": ["error", 2],
      "vue/html-self-closing": "off", // TODO Check this rule
      // TODO: this following rule
      // "vue/html-self-closing": ["error", { // TODO Check this rule
      //   html: {
      //     void: "always",
      //     normal: "never",
      //     component: "always"
      //   },
      //   svg: "always",
      //   math: "always"
      // }],
      "vue/max-attributes-per-line": ["error", {
        singleline: {
          max: 100
        },
        multiline: {
          max: 1
        }
      }],
      "vue/max-len": ["error", {
        code: 80,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
        ignoreHTMLAttributeValues: true,
        ignoreHTMLTextContents: true
      }],
      "vue/multiline-html-element-content-newline": "off", // TODO Check this rule
      "vue/no-unused-refs": "off", // TODO Check this rule
      "vue/no-useless-v-bind": "off", // TODO Check this rule
      "vue/operator-linebreak": "off", // TODO Check this rule
      "vue/object-shorthand": "off", // TODO Check this rule
      "vue/padding-line-between-blocks": "off", // TODO Check this rule
      "vue/prefer-separate-static-class": "off", // TODO Check this rule
      "vue/prefer-template": "off", // TODO Check this rule
      "vue/singleline-html-element-content-newline": "off", // TODO Check this rule
      "vue/no-irregular-whitespace": ["error", {
        skipStrings: true,
        skipComments: true,
        skipRegExps: true,
        skipTemplates: true,
        skipHTMLAttributeValues: true,
        skipHTMLTextContents: true
      }]
    }
  },

  yaml: {
    overrides: {
      "yaml/plain-scalar": "off" // TODO Check this rule
    }
  },

  ignores: [
    "confiture-rest-api/confiture-api.ts",
    "confiture-rest-api/src/generated",
    "confiture-web-app/accessibilite.numerique.gouv.fr",
    "confiture-web-app/src/criteres.json",
    "confiture-web-app/src/methodologies.json",
    "confiture-web-app/src/types/confiture-api.ts",
    "**/migration_lock.toml"
  ],
  formatters: true
}, {
  files: ["**/*.{js,mjs,ts,vue}"],
  rules: {
    "import/first": "off", // TODO Check this rule
    "import/newline-after-import": "off", // TODO Check this rule
    "regexp/match-any": "off", // TODO Check this rule
    "regexp/no-misleading-capturing-group": "off", // TODO Check this rule
    "regexp/no-unused-capturing-group": "off", // TODO Check this rule
    "regexp/no-obscure-range": "off", // TODO Check this rule
    "regexp/no-useless-lazy": "off", // TODO Check this rule
    "regexp/no-useless-quantifier": "off", // TODO Check this rule
    "regexp/no-super-linear-backtracking": "off", // TODO Check this rule
    "regexp/prefer-d": "off", // TODO Check this rule
    "regexp/strict": "off", // TODO Check this rule
    "regexp/use-ignore-case": "off" // TODO Check this rule
  }
}, {
  files: ["**/*.{js,mjs,ts}"],
  rules: {
    "no-irregular-whitespace": ["error", {
      skipComments: true,
      skipJSXText: true,
      skipRegExps: true,
      skipStrings: true,
      skipTemplates: true
    }]
  }
}, {
  files: ["confiture-rest-api/**/*.{js,mjs,ts}"],
  rules: {
    "no-console": "off"
  }
}, {
  files: ["confiture-web-app/**/*.{js,mjs,ts,vue}"],
  rules: {
    "no-console": "off" // TODO Check this rule
  }
}, {
  files: ["**/*.json"],
  rules: {
    "jsonc/sort-keys": "off" // TODO Check this rule
  }
}, {
  files: ["**/*.md"],
  rules: {
    "format/prettier": ["error", { // TODO Check this rule
      endOfLine: "auto",
      printWidth: 120,
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      trailingComma: "all",
      useTabs: false,
      embeddedLanguageFormatting: "off",
      parser: "markdown",
      plugins: []
    }]
  }
}, {
  // See https://github.com/eslint/markdown/issues/114#issuecomment-818463890
  // "it's not possible to use type-aware linting rules with any ESLint processors"
  // So here we remove type-aware linting for Mardown files.
  files: ["**/*.md/**"],
  languageOptions: {
    parserOptions: {
      projectService: null
    }
  }
});
