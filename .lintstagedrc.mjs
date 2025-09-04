export default {
  // --no-warn-ignored option prevents lint-staged from displaying a warning
  // because "yarn.lock" is ignored
  "*": () => ["eslint . --no-warn-ignored", "yarn lint:styles"]
};
