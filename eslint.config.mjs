import globals from "globals";
import pluginJs from "@eslint/js";
import pluginJest from "eslint-plugin-jest";
import pluginPrettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier"; // Disables ESLint rules conflicting with Prettier

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node.js globals here
        ...globals.jest, // Add Jest globals here
      },
    },
    plugins: {
      jest: pluginJest,
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginJest.configs.recommended.rules, // Apply Jest's recommended rules
      "prettier/prettier": ["error"], // Enforces Prettier rules via ESLint
      "no-console": "warn", // Other ESLint rules are still enforced
      eqeqeq: "error",
      curly: ["error", "all"],
      camelcase: "error",
      "prefer-const": "error",
    },
  },
  // Include JavaScript recommended rules
  pluginJs.configs.recommended,
  // Prettier configuration to turn off conflicting ESLint rules
  prettierConfig,
];
