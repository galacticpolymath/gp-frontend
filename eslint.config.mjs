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

const jsTargets = [
  ...jobVizComponentTargets,
  "pages/jobviz/**/*.{js,jsx,ts,tsx}",
  "components/Modals/SelectedJob.tsx",
  "scripts/**/*.js",
];

const tsTargets = [
  ...jobVizComponentTargets.filter((file) => file.endsWith(".ts") || file.endsWith(".tsx")),
  "pages/jobviz/**/*.{ts,tsx}",
  "components/Modals/SelectedJob.tsx",
];

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
      files: jsTargets,
    };
  }
  return entry;
});

export default [
  ...scopedNextConfig,
  {
    files: jsTargets,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**"],
  },
];
