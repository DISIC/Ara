/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-recommended", "stylelint-config-standard-vue"],
  rules: {
    "selector-class-pattern": null,
    "no-descending-specificity": null,
    "shorthand-property-no-redundant-values": null,
    "color-hex-length": "long"
  },
  overrides: [
    {
      files: ["**/*.html", "**.*.vue"],
      rules: {
        "custom-property-empty-line-before": null
      }
    }
  ]
};
