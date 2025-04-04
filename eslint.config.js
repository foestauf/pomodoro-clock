// @ts-check

import reactCompiler from "eslint-plugin-react-compiler";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import hooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: ["**/*.config.js", "**/dist/**", "**/*.config.ts"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      "react-compiler": reactCompiler,
      "react-hooks": hooksPlugin,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "react-compiler/react-compiler": "error",
      ...hooksPlugin.configs.recommended.rules,
    },
  }
);
