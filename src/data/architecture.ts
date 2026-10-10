// Navigation and ownership live together so chapter order and record destinations
// cannot drift apart. A linked name is an index entry, not a second project story.
export type Bilingual = readonly [zh: string, en: string];
export const siteChapters = [
  { id: "home", label: ["认识我", "About"], caption: ["陈天一 / Choney Chen", "Tianyi / Choney Chen"], group: ["认识我", "Introduction"], style: "PERSONAL PORTRAIT", colour: "#304de8" },
  { id: "directions", label: ["方向", "Directions"], caption: ["三个研究方向", "Three research directions"], group: ["认识我", "Introduction"], style: "RIBBON / SECTION / FOLIO", colour: "#274bee" },
  { id: "glimpse", label: ["毕业研究", "Dissertation"], caption: ["U-IMPROVE / FYP", "U-IMPROVE / FYP"], group: ["空间研究", "Spatial research"], style: "GLASS BLUEPRINT", colour: "#214dcb" },
  { id: "cosmos", label: ["定位", "Locate"], caption: ["Cosmos-Loc", "Cosmos-Loc"], group: ["空间研究", "Spatial research"], style: "PIXEL ARCADE", colour: "#9e65d0" },
  { id: "sups", label: ["造景", "Build"], caption: ["SUPS / SVL", "SUPS / SVL"], group: ["空间研究", "Spatial research"], style: "ISOMETRIC WORLD", colour: "#3047b9" },
  { id: "avpc", label: ["协同", "Collaborate"], caption: ["AVPC 协同研究", "AVPC collaboration"], group: ["空间研究", "Spatial research"], style: "TWO PERSPECTIVES", colour: "#6c183c" },
  { id: "mask", label: ["原型", "Prototype"], caption: ["智能光疗面罩 / MEC202", "Phototherapy mask / MEC202"], group: ["应用工程", "Applied engineering"], style: "PRODUCT STORY", colour: "#2458f2" },
  { id: "esg", label: ["环境", "Environment"], caption: ["ESG 数据平台与实习", "ESG data platform & internship"], group: ["应用工程", "Applied engineering"], style: "DOCUMENT DESK", colour: "#0f4e3d" },
  { id: "tools", label: ["工具", "Tools"], caption: ["个人研究工作流与工具", "Personal research workflow & tools"], group: ["个人工具", "Personal tools"], style: "3D WORK FILES", colour: "#cf633b" },
  { id: "origins", label: ["起点", "Origins"], caption: ["三段早期经历", "Three early experiences"], group: ["成长与方法", "Foundations & practice"], style: "PAPER ARCHIVE", colour: "#cc6d44" },
  { id: "archive", label: ["学习", "Learning"], caption: ["教育、课程与经历索引", "Education, coursework & index"], group: ["成长与方法", "Foundations & practice"], style: "PERSONAL ALMANAC", colour: "#c0ad8f" },
  { id: "methods", label: ["方法", "Methods"], caption: ["我的四项工作方法", "Four working practices"], group: ["成长与方法", "Foundations & practice"], style: "HAND-DRAWN NOTES", colour: "#285baf" },
  { id: "next", label: ["个人", "Personal"], caption: ["我的来处与长远选择", "Where I come from & what I value"], group: ["成长与方法", "Foundations & practice"], style: "PERSONAL COLLAGE", colour: "#254cc7" },
  { id: "contact", label: ["联系", "Contact"], caption: ["与我保持联系", "Get in touch"], group: ["联系", "Contact"], style: "PERSONAL CORRESPONDENCE", colour: "#bda987" },
] as const;

export const learningIds = ["education", "can201", "isa305"] as const;
export const earlyExperienceIds = ["lif001", "kaiding", "surf-wearable"] as const;

export const canonicalIndex = [
  { record: "fyp", owner: "glimpse", label: ["U-IMPROVE 毕业研究", "U-IMPROVE dissertation"] },
  { record: "cosmos-research", owner: "cosmos", label: ["Cosmos-Loc / 停车场 SURF", "Cosmos-Loc / car-park SURF"] },
  { record: "sups-simulation", owner: "sups", label: ["SUPS / SVL 场景扩展", "SUPS / SVL scene extensions"] },
  { record: "avpc-research", owner: "avpc", label: ["AVPC 协同感知", "AVPC collaborative perception"] },
  { record: "mec202", owner: "mask", label: ["MEC202 原型与创客竞赛", "MEC202 prototype & maker competition"] },
  { record: "esg-internship", owner: "esg", label: ["ESG 数据平台与研究院实习", "ESG platform & institute internship"] },
  { record: "stock-tool", owner: "tools", label: ["可追溯的文章研究工作流", "Traceable article-research workflow"] },
  { record: "quantpilot", owner: "tools", label: ["QuantPilot 公开代码仓库", "QuantPilot public repository"] },
  { record: "lif001", owner: "origins", label: ["LIF001 客流预测", "LIF001 footfall prediction"] },
  { record: "kaiding", owner: "origins", label: ["凯鼎动力 IT 实习", "Kaiding Power IT internship"] },
  { record: "surf-wearable", owner: "origins", label: ["SURF 可穿戴数据采集", "SURF wearable data collection"] },
] as const;

// These are related milestones of existing work, never additional projects.
export const relatedMilestones = { "surf-parking": "cosmos-research", "maker-award": "mec202" } as const;
