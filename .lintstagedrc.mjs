export default {
  // --no-warn-ignored option prevents lint-staged from displaying a warning
  // because "yarn.lock" is ignored
  "*.css": ["stylelint"],
  "*.vue": ["stylelint", "eslint --no-warn-ignored"],
  "!*.{css,vue}": ["eslint --no-warn-ignored"]
};
