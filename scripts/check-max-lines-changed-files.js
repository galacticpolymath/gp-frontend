#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const repoRoot = process.cwd();
const maxLines = Number(process.env.MAX_LINES || 800);
const baseSha = process.env.BASE_SHA;
const headSha = process.env.HEAD_SHA;

const checkableExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
]);

const allowlist = new Set([
  "components/JobViz/iconMappings.ts",
  "components/JobViz/jobviz_job_icon_mapping.csv",
]);

function normalizeRelative(filePath) {
  return filePath.replace(/\\/g, "/");
}

function getChangedFiles() {
  let diffTarget = "";
  if (baseSha && headSha) {
    diffTarget = `${baseSha}...${headSha}`;
  } else {
    diffTarget = "HEAD~1...HEAD";
  }

  const output = execSync(
    `git diff --name-only --diff-filter=ACMRT ${diffTarget}`,
    {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }
  ).trim();

  if (!output) return [];
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(normalizeRelative);
}

function countLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  if (content.length === 0) return 0;
  return content.split(/\r?\n/).length;
}

function isCheckable(filePath) {
  const ext = path.extname(filePath);
  return checkableExtensions.has(ext);
}

function main() {
  let changedFiles = [];
  try {
    changedFiles = getChangedFiles();
  } catch (error) {
    console.error("Unable to read changed files from git diff.");
    console.error(error.message);
    process.exit(1);
  }

  if (!changedFiles.length) {
    console.log("No changed files detected. Skipping max-line check.");
    return;
  }

  const offenders = [];
  const checkedFiles = [];

  for (const relativePath of changedFiles) {
    if (allowlist.has(relativePath) || !isCheckable(relativePath)) {
      continue;
    }
    const absolutePath = path.join(repoRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }
    const lines = countLines(absolutePath);
    checkedFiles.push({ relativePath, lines });
    if (lines > maxLines) {
      offenders.push({ relativePath, lines });
    }
  }

  console.log(
    `Checked ${checkedFiles.length} changed code/style file(s) against max ${maxLines} lines.`
  );

  if (!offenders.length) {
    console.log("Max-line check passed.");
    return;
  }

  console.error("Max-line check failed. Files over the limit:");
  offenders.forEach(({ relativePath, lines }) => {
    console.error(`- ${relativePath}: ${lines} lines (max ${maxLines})`);
  });
  console.error(
    "Split oversized files by functional UI/logic boundaries or add a justified allowlist entry."
  );
  process.exit(1);
}

main();
