import nextConfig from "eslint-config-next";
import globals from "globals";

const jsTargets = ["**/*.{js,jsx}"];

const tsTargets = ["**/*.{ts,tsx}"];

const scopedNextConfig = nextConfig.map((entry) => {
  if (!entry) return entry;
  if (entry.name === "next/typescript") {
    return {
      ...entry,
      files: tsTargets,
    };
  }
  if (Array.isArray(entry.files)) {
    return {
      ...entry,
      files: ["**/*.{js,jsx,ts,tsx}"],
    };
  }
  return entry;
});

export default [
  ...scopedNextConfig,
  {
    files: jsTargets,
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**"],
  },
  {
    files: tsTargets,
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "warn",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
