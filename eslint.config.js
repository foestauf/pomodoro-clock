// @ts-check

import reactCompiler from "eslint-plugin-react-compiler";
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
  {
    plugins: {
      "react-compiler": reactCompiler,
      "react-hooks": hooksPlugin,
    },
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
      "react-compiler/react-compiler": "error",
      ...hooksPlugin.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
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
        project: "./tsconfig.json",
        allowDefaultProject: true,
      },
    },
  }
);
