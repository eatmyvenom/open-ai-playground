/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  root: true,
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "prettier/prettier": "error",
  },
};
