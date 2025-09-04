/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-recommended", "stylelint-config-standard-vue"],
  rules: {
    "selector-class-pattern": null,
    "no-descending-specificity": null,
    "color-hex-length": "long"
  }
};
