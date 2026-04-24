// @ts-check

import eslint from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import hooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: ["**/*.config.js", "**/dist/**", "**/*.config.ts"],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintReact.configs["recommended-type-checked"],
  hooksPlugin.configs.flat.recommended,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect": "off",
    },
  },
  // Add specific configuration for e2e tests
  {
    files: ["**/e2e/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        allowDefaultProject: true,
      },
    },
  },
  // Test files: relax rules that conflict with common test ergonomics
  // (non-null assertions on querySelector, mock.fn empty bodies).
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/test-utils.tsx",
      "vitest.setup.ts",
    ],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  }
);
