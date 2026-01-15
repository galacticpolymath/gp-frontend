import fs from "node:fs";
import path from "node:path";

const readScss = (relativePath: string) => {
  const absolutePath = path.join(process.cwd(), relativePath);
  return fs.readFileSync(absolutePath, "utf8");
};

const extractBlock = (source: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped}\\s*\\{[\\s\\S]*?\\n\\}`, "m");
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Unable to find styles for selector: ${selector}`);
  }
  return match[0];
};

const jobvizStyles = readScss("styles/jobvizBurst.module.scss");
const selectedJobStyles = readScss("styles/pages/JobViz/modals/selectedJobStyles.scss");

describe("JobViz critical style guardrails", () => {
  it("keeps the assignment scroll tooltip overlay above all other layers", () => {
    const block = extractBlock(jobvizStyles, ".assignmentScrollTipOverlay");
    expect(block).toContain("z-index: 1600");
  });

  it("prevents stray margins on the default assignment banner container", () => {
    const block = extractBlock(jobvizStyles, ".assignmentBannerDefault");
    expect(block).toContain("margin: 0;");
  });

  it("keeps the mobile assignment wrapper flush against the main JobViz UI", () => {
    const wrapperBlock = extractBlock(jobvizStyles, ".assignmentMobileWrapper");
    expect(wrapperBlock).toContain("margin-bottom: 0;");
    const collapsedBlock = extractBlock(
      jobvizStyles,
      '.assignmentMobileWrapper[data-collapsed="true"]'
    );
    expect(collapsedBlock).toContain("margin-bottom: 0;");
  });

  it("offsets the selected job modal body so the assignment remains accessible", () => {
    expect(selectedJobStyles).toMatch(/calc\(var\(--jobviz-assignment-offset, 0px\)/);
  });

  it("positions the summary modal above the assignment dock", () => {
    const rootBlock = extractBlock(jobvizStyles, ".summaryModalRoot");
    expect(rootBlock).toContain("z-index: 12000080");
  });

  it("anchors the summary modal dialog to the nav/assignment offsets", () => {
    expect(jobvizStyles).toMatch(
      /\.summaryModalDialog[\s\S]*margin-top:\s*calc\(\s*var\(--jobviz-nav-offset/
    );
  });
});
