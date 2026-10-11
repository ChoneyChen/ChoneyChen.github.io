// Navigation and ownership live together so chapter order and record destinations
// cannot drift apart. The directory carries navigation; project records have one detail location.
export type Bilingual = readonly [zh: string, en: string];
export const siteChapters = [
  { id: "home", label: ["认识我", "About"], caption: ["陈天一 / Choney Chen", "Tianyi / Choney Chen"], group: ["认识我", "Introduction"], style: "PERSONAL PORTRAIT", colour: "#304de8" },
  { id: "directions", label: ["方向", "Directions"], caption: ["三个研究方向", "Three research directions"], group: ["认识我", "Introduction"], style: "RIBBON / SECTION / FOLIO", colour: "#274bee" },
  { id: "glimpse", label: ["毕业研究", "Dissertation"], caption: ["U-IMPROVE / FYP", "U-IMPROVE / FYP"], group: ["空间研究", "Spatial research"], style: "GLASS BLUEPRINT", colour: "#214dcb" },
  { id: "cosmos", label: ["定位", "Locate"], caption: ["Cosmos-Loc", "Cosmos-Loc"], group: ["空间研究", "Spatial research"], style: "PIXEL ARCADE", colour: "#9e65d0" },
  { id: "sups", label: ["造景", "Build"], caption: ["SUPS / SVL", "SUPS / SVL"], group: ["空间研究", "Spatial research"], style: "ISOMETRIC WORLD", colour: "#3047b9" },
  { id: "avpc", label: ["协同", "Collaborate"], caption: ["AVPC 协同研究", "AVPC collaboration"], group: ["空间研究", "Spatial research"], style: "TWO PERSPECTIVES", colour: "#6c183c" },
  { id: "mask", label: ["原型", "Prototype"], caption: ["智能光疗面罩系统", "Phototherapy mask system"], group: ["应用工程", "Applied engineering"], style: "PRODUCT STORY", colour: "#2458f2" },
  { id: "esg", label: ["环境", "Environment"], caption: ["ESG 数据平台与实习", "ESG data platform & internship"], group: ["应用工程", "Applied engineering"], style: "DOCUMENT DESK", colour: "#0f4e3d" },
  { id: "tools", label: ["工具", "Tools"], caption: ["个人研究工作流与工具", "Personal research workflow & tools"], group: ["个人工具", "Personal tools"], style: "3D WORK FILES", colour: "#cf633b" },
  { id: "origins", label: ["经历", "Experience"], caption: ["实习与研究经历", "Professional & research experience"], group: ["经历与基础", "Experience & foundation"], style: "MECHANICAL / FIELD NOTES", colour: "#cc6d44" },
  { id: "archive", label: ["基础", "Foundation"], caption: ["教育与技术基础", "Education & technical foundation"], group: ["经历与基础", "Experience & foundation"], style: "CLASSICAL FOUNDATION", colour: "#c0ad8f" },
  { id: "contact", label: ["联系", "Contact"], caption: ["与我保持联系", "Get in touch"], group: ["联系", "Contact"], style: "PERSONAL CORRESPONDENCE", colour: "#bda987" },
] as const;

// Canonical source ownership is internal; it never creates a second project index.
export const recordOwnership = {
  fyp: "glimpse", "cosmos-research": "cosmos", "surf-parking": "cosmos",
  "sups-simulation": "sups", "avpc-research": "avpc", mec202: "mask", "maker-award": "mask",
  "esg-internship": "esg", "stock-tool": "tools", quantpilot: "tools",
  kaiding: "origins", "surf-wearable": "origins", education: "archive",
  lif001: "archive", can201: "archive", isa305: "archive",
} as const;
