import nextConfig from "eslint-config-next";
import globals from "globals";

const jobVizComponentTargets = [
  "components/JobViz/AssignmentBanner.tsx",
  "components/JobViz/Heros/HeroForFreeUsers.tsx",
  "components/JobViz/JobVizBreadcrumb.tsx",
  "components/JobViz/JobVizCard.tsx",
  "components/JobViz/JobVizGrid.tsx",
  "components/JobViz/JobVizLayout.tsx",
  "components/JobViz/JobVizSearch.tsx",
  "components/JobViz/jobvizUtils.ts",
  "components/JobViz/iconMappings.ts",
  "components/JobViz/infoModalContent.ts",
];

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
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
    },
  },
];
