// --no-warn-ignored option prevents lint-staged from displaying a warning
// because "yarn.lock" is ignored
const eslint = "eslint --no-warn-ignored --fix";
const stylelint = "stylelint --fix";
export default {
  "*.css": [stylelint],
  "*.vue": [stylelint, eslint],
  "!*.{css,vue}": [eslint]
};
