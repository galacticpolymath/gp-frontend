#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const dataPath = path.join(projectRoot, "data/Jobviz/jobVizDataObj.json");
const categoryCsvPath = path.join(
  projectRoot,
  "components/JobViz/jobviz_icon_mapping - chatGPT_output.csv"
);
const jobIconCsvPath = path.join(
  projectRoot,
  "components/JobViz/jobviz_job_icon_mapping.csv"
);
const outputTsPath = path.join(projectRoot, "components/JobViz/iconMappings.ts");
const lucideIconsDir = path.join(
  projectRoot,
  "node_modules/lucide-react/dist/esm/icons"
);

const jobvizData = require(dataPath).data;
const categoryLines = fs
  .readFileSync(categoryCsvPath, "utf8")
  .split(/\r?\n/)
  .filter((line) => line.trim().length > 0);
const categoryIconMap = {};
for (const line of categoryLines) {
  if (line.startsWith("soc_code")) continue;
  const [socCode] = line.split(",");
  if (!socCode) continue;
  const iconMatch = line.match(/<([A-Za-z0-9]+)\s*\/>/);
  if (iconMatch) {
    categoryIconMap[socCode.trim()] = iconMatch[1];
  }
}

const toPascal = (name) =>
  name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const iconFiles = fs
  .readdirSync(lucideIconsDir)
  .filter((file) => file.endsWith(".js"));
const iconPool = iconFiles
  .map((file) => toPascal(file.replace(/\.js$/, "")))
  .filter((name) => /^[A-Z]/.test(name));

const keywordIconMap = [
  { keywords: ["nurse", "therap", "medical", "surgeon"], icons: ["Stethoscope", "HeartPulse", "Hospital", "Bandage"] },
  { keywords: ["teacher", "instructor", "educat"], icons: ["GraduationCap", "Presentation", "BookOpenCheck"] },
  { keywords: ["engineer", "engineering", "architect"], icons: ["Cog", "Wrench", "DraftingCompass"] },
  { keywords: ["scientist", "scientific", "chemist", "biolog"], icons: ["Atom", "FlaskConical", "TestTube"] },
  { keywords: ["developer", "programmer", "software", "data", "analyst", "analytical"], icons: ["Code2", "Cpu", "Binary"] },
  { keywords: ["manager", "supervisor", "director"], icons: ["BriefcaseBusiness", "ClipboardList", "ClipboardCheck"] },
  { keywords: ["finance", "financial", "account", "econom"], icons: ["LineChart", "Calculator", "PiggyBank"] },
  { keywords: ["legal", "law", "court", "judge"], icons: ["Gavel", "Scale", "ScrollText"] },
  { keywords: ["writer", "editor", "author", "media"], icons: ["PenSquare", "Newspaper", "Mic"] },
  { keywords: ["artist", "designer", "graphic", "perform"], icons: ["Palette", "Sparkles", "Music3"] },
  { keywords: ["social", "community", "counsel"], icons: ["Users", "HelpingHand", "HeartHandshake"] },
  { keywords: ["construction", "carpenter", "electric"], icons: ["Hammer", "Saw", "PlugZap"] },
  { keywords: ["mechanic", "machin", "industrial"], icons: ["Factory", "Wrench", "Fuel"] },
  { keywords: ["transport", "driver", "pilot", "captain"], icons: ["Truck", "Ship", "Plane"] },
  { keywords: ["farmer", "agric", "soil", "crop"], icons: ["Sprout", "Tractor", "Leaf"] },
  { keywords: ["food", "chef", "cook"], icons: ["ChefHat", "Utensils", "CupSoda"] },
  { keywords: ["clean", "maintenance", "janitor"], icons: ["Broom", "SprayCan", "Sparkle"] },
  { keywords: ["security", "police", "protect"], icons: ["Shield", "Badge", "ShieldCheck"] },
  { keywords: ["fire", "ems", "rescue"], icons: ["Flame", "AlarmSmoke", "LifeBuoy"] },
  { keywords: ["sales", "marketing", "retail"], icons: ["ShoppingBag", "Megaphone", "ReceiptText"] },
  { keywords: ["human resources", "recruit"], icons: ["UsersRound", "IdCard"] },
  { keywords: ["logistic", "supply", "warehouse"], icons: ["Boxes", "Warehouse", "Package"] },
  { keywords: ["customer", "support", "service"], icons: ["Headset", "MessageSquare", "PhoneCall"] },
  { keywords: ["environment", "earth", "wildlife"], icons: ["Globe", "Mountain", "TreeDeciduous"] },
  { keywords: ["energy", "power", "renewable"], icons: ["BatteryCharging", "SolarPanel", "Bolt"] },
];

const jobNodes = jobvizData.filter((node) => node.occupation_type === "Line item");
const usedIcons = new Set();
const jobIconMap = {};
let fallbackIndex = 0;

const reserveIcon = (name) => {
  if (!name) return null;
  if (usedIcons.has(name)) return null;
  usedIcons.add(name);
  return name;
};

const takeFallbackIcon = () => {
  while (fallbackIndex < iconPool.length) {
    const candidate = iconPool[fallbackIndex++];
    if (!usedIcons.has(candidate)) {
      usedIcons.add(candidate);
      return candidate;
    }
  }
  throw new Error("Ran out of Lucide icons for job mapping");
};

const findKeywordIcon = (title) => {
  const normalized = title.toLowerCase();
  for (const group of keywordIconMap) {
    if (group.keywords.some((kw) => normalized.includes(kw))) {
      for (const icon of group.icons) {
        const reserved = reserveIcon(icon);
        if (reserved) return reserved;
      }
    }
  }
  return null;
};

for (const node of jobNodes) {
  let icon = findKeywordIcon(node.title);
  if (!icon) {
    icon = takeFallbackIcon();
  }
  jobIconMap[node.soc_code] = icon;
}

const sortEntries = (obj) =>
  Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));

const tsContent = `export const categoryIconMap = ${JSON.stringify(sortEntries(categoryIconMap), null, 2)} as const;\n\nexport const jobIconMap = ${JSON.stringify(sortEntries(jobIconMap), null, 2)} as const;\n`;
fs.writeFileSync(outputTsPath, tsContent);

const csvLines = ["soc_code,job_title,icon_name"];
for (const node of jobNodes) {
  const safeTitle = node.title.replace(/"/g, '""');
  csvLines.push(`${node.soc_code},"${safeTitle}",${jobIconMap[node.soc_code]}`);
}
fs.writeFileSync(jobIconCsvPath, csvLines.join("\n"));

console.log(`Generated ${Object.keys(jobIconMap).length} job icon mappings.`);
