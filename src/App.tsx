import { ReadingReveal } from "./components/ReadingReveal";
import { slowMotion, slowDragRelease, slowSpring, motionTimingStyle } from "./lib/motionTiming";
import { useCollapseOnLeave, useReadingExit } from "./hooks/useCollapseOnLeave";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  memo,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useInView,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Workflow,
  ChevronLeft,
  ChevronRight,
  Layers,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { CosmosChapter } from "./components/CosmosChapter";
import { SupsChapter } from "./components/SupsChapter";
import { MaskChapter } from "./components/MaskChapter";
import { ESGChapter } from "./components/ESGChapter";
import { FutureChapter } from "./components/FutureChapter";
import { useContent } from "./data/use-content";
import { useI18n } from "./i18n";
import { SteampunkWork, RomanEducation } from "./components/HistoryDetails";
import { MethodsChapter } from "./components/MethodsChapter";
import { ToolsChapter } from "./components/ToolsChapter";
import { PersonalPortrait } from "./components/PersonalPortrait";
import { ContactChapter } from "./components/ContactChapter";
import { ResearchDirections } from "./components/ResearchDirections";
import { useChapterAnchors } from "./hooks/useChapterAnchors";
import { useChapterSnap } from "./hooks/useChapterSnap";

const presentationTransition = slowMotion({
  type: "spring",
  stiffness: 140,
  damping: 22,
});
const quietTransition = { type: "tween", duration: 0 } as const;

function getChapters(t: (zh: string, en: string) => string) {
  return [
    {
      id: "home",
      label: t("认识我", "About"),
      caption: t("陈天一 / Choney Chen", "Tianyi / Choney Chen"),
      style: "PERSONAL PORTRAIT",
      colour: "#304de8",
    },
    {
      id: "origins",
      label: t("起点", "Origins"),
      caption: t("从日常问题开始", "Starting with everyday questions"),
      style: "PAPER ARCHIVE",
      colour: "#cc6d44",
    },
    {
      id: "methods",
      label: t("方法", "Methods"),
      caption: t("我怎样做一件事", "How I approach a piece of work"),
      style: "HAND-DRAWN NOTES",
      colour: "#285baf",
    },
    {
      id: "directions",
      label: t("方向", "Directions"),
      caption: t("我的三个研究方向", "My three research directions"),
      style: "RIBBON / SECTION / FOLIO",
      colour: "#274bee",
    },
    {
      id: "cosmos",
      label: t("定位", "Locate"),
      caption: "Cosmos-Loc",
      style: "PIXEL ARCADE",
      colour: "#9e65d0",
    },
    {
      id: "sups",
      label: t("造景", "Build"),
      caption: "SUPS / SVL",
      style: "ISOMETRIC WORLD",
      colour: "#3047b9",
    },
    {
      id: "mask",
      label: t("系统", "Systems"),
      caption: t("智能光疗面罩", "Intelligent phototherapy mask"),
      style: "PRODUCT STORY",
      colour: "#2458f2",
    },
    {
      id: "esg",
      label: t("环境", "Environment"),
      caption: "ESG AI",
      style: "DOCUMENT DESK",
      colour: "#0f4e3d",
    },
    {
      id: "glimpse",
      label: t("下一问", "Next question"),
      caption: "U-IMPROVE / FYP",
      style: "GLASS BLUEPRINT",
      colour: "#214dcb",
    },
    {
      id: "avpc",
      label: t("协同", "Collaborate"),
      caption: t("AVPC 研究", "AVPC research"),
      style: "TWO PERSPECTIVES",
      colour: "#6c183c",
    },
    {
      id: "tools",
      label: t("工具", "Tools"),
      caption: t("我的研究工具档案", "My research-tool archive"),
      style: "3D WORK FILES",
      colour: "#cf633b",
    },
    {
      id: "archive",
      label: t("足迹", "Archive"),
      caption: t("完整经历索引", "My experience index"),
      style: "PERSONAL ALMANAC",
      colour: "#c0ad8f",
    },
    {
      id: "next",
      label: t("继续", "Continuing"),
      caption: t("关于接下来的我", "What I am exploring next"),
      style: "STILL BECOMING",
      colour: "#254cc7",
    },
    {
      id: "contact",
      label: t("联系", "Contact"),
      caption: t("与我保持联系", "Get in touch"),
      style: "PERSONAL CORRESPONDENCE",
      colour: "#bda987",
    },
  ];
}

function getIdentities(t: (zh: string, en: string) => string) {
  return [
    {
      label: t("学生", "Student"),
      number: "01",
      title: "XJTLU",
      subtitle: t("西交利物浦大学", "Xi’an Jiaotong-Liverpool University"),
      detail: t(
        "计算机科学与技术 · Bachelor of Engineering",
        "Computer Science and Technology · BEng",
      ),
      note: t("2023.09 — 2027.06（预计）", "2023.09 — 2027.06 (expected)"),
      stamp: "STAGE 4",
      lines: [
        t(
          "本科最后一年，正在推进毕业研究。",
          "In my final undergraduate year, working on my dissertation.",
        ),
        t(
          "从编程、统计与系统基础，走向视觉和空间感知。",
          "From programming, statistics, and systems to visual and spatial perception.",
        ),
      ],
      link: "#origins",
      linkLabel: t("看看我的起点", "Explore my beginnings"),
    },
    {
      label: t("研究者", "Researcher"),
      number: "02",
      title: "LOOK CLOSER.",
      subtitle: t("视觉 · 空间 · 多模态", "Vision · Space · Multimodal AI"),
      detail: t(
        "Gordon Owusu Boateng 研究团队",
        "Gordon Owusu Boateng’s research team",
      ),
      note: t("从 Cosmos-Loc 到 U-IMPROVE", "From Cosmos-Loc to U-IMPROVE"),
      stamp: "IN PROGRESS",
      lines: [
        t(
          "参与 Qwen 训练、实验对比与定位评估。",
          "Contributing to Qwen training, experimental comparisons, and localisation evaluation.",
        ),
        t(
          "U-IMPROVE 毕业研究连接目标存在性、像素语义与度量几何。",
          "My U-IMPROVE dissertation connects target presence, pixel semantics and metric geometry.",
        ),
      ],
      link: "#cosmos",
      linkLabel: t("走进我的研究", "Step into my research"),
    },
    {
      label: t("实践者", "Practitioner"),
      number: "03",
      title: "MAKE IT WORK.",
      subtitle: t(
        "软件 · 嵌入式 · 环境 AI",
        "Software · Embedded systems · Environmental AI",
      ),
      detail: t(
        "把不同的模块，做成可以检查的系统",
        "Connecting modules into systems we can examine",
      ),
      note: t(
        "工程原型 / 团队协作 / 数据平台",
        "Engineering prototypes / Teams / Data platforms",
      ),
      stamp: "HANDS ON",
      lines: [
        t(
          "曾担任智能光疗面罩团队组长，参与跨模块联调。",
          "Led the phototherapy-mask team and contributed to cross-module integration.",
        ),
        t(
          "现在于清华大学苏州环境创新研究院实习。",
          "Currently interning at Tsinghua University’s environmental innovation institute in Suzhou.",
        ),
      ],
      link: "#mask",
      linkLabel: t("看看我做的系统", "Explore my systems work"),
    },
  ];
}

function cycleTabs(
  event: ReactKeyboardEvent<HTMLDivElement>,
  current: number,
  count: number,
  select: (index: number) => void,
) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? count - 1
        : (current + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
  select(next);
  event.currentTarget
    .querySelectorAll<HTMLButtonElement>("[role='tab']")
    [next]?.focus();
}

function IdentityFold({ quiet, entered }: { quiet: boolean; entered: boolean }) {
  const { t } = useI18n();
  const identities = getIdentities(t);
  const [identity, setIdentity] = useState<number | null>(null);
  useCollapseOnLeave("home", () => setIdentity(null));
  const page = identity === null ? null : identities[identity];
  return (
    <motion.div
      className="identity-fold"
      initial={quiet ? false : { opacity: 0, rotateX: -16, y: 36 }}
      animate={quiet || entered ? { opacity: 1, rotateX: 0, y: 0 } : { opacity: 0, rotateX: -10, y: 28 }}
      transition={
        slowMotion(quiet
          ? { duration: 0 }
          : { duration: 0.9, delay: 0.22, ease: [0.16, 1, 0.3, 1] })
      }
    >
      <div className="identity-underleaf" aria-hidden="true">
        <span>TIANYI CHEN</span>
        <span>AN ONGOING INDEX</span>
      </div>
      <div
        className="identity-tabs"
        role="tablist"
        aria-label={t(
          "从三个身份认识陈天一",
          "Get to know Tianyi through three roles",
        )}
        onKeyDown={(event) =>
          cycleTabs(event, identity ?? 0, identities.length, setIdentity)
        }
      >
        {identities.map((item, index) => (
          <button
            key={item.label}
            role="tab"
            id={`identity-tab-${index}`}
            aria-controls="identity-page"
            aria-selected={identity === index}
            tabIndex={identity === index || (identity === null && index === 0) ? 0 : -1}
            aria-expanded={identity === index}
            onClick={() => setIdentity(identity === index ? null : index)}
          >
            <span>{item.number}</span>
            {item.label}
          </button>
        ))}
      </div>
      <motion.div
        className="identity-paper"
        animate={{
          rotate: quiet ? 0 : identity === 1 ? -2 : identity === 2 ? 2 : -4,
        }}
        transition={slowMotion(quiet ? { duration: 0 } : { type: "spring", stiffness: 130, damping: 20 })}
      >
        <div className="identity-paper-top">
          <span>CHONEY CHEN</span>
          <span>PERSONAL FILE / {page?.number ?? "INDEX"}</span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {page && identity !== null ? <motion.div
            key={identity}
            role="tabpanel"
            id="identity-page"
            aria-labelledby={`identity-tab-${identity}`}
            className="identity-page"
            initial={{ opacity: 0, y: quiet ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: quiet ? 0 : -10 }}
            transition={slowMotion({ duration: quiet ? 0 : 0.22 })}
          >
            <button className="reading-close identity-close" onClick={() => setIdentity(null)} aria-label={t("合上身份档案", "Close role file")}><X size={16} /></button>
            <div className="identity-title">{page.title}</div>
            <h2>{page.subtitle}</h2>
            <p className="identity-detail">{page.detail}</p>
            <div className="identity-rule" />
            <p className="identity-note">{page.note}</p>
            <ul>
              {page.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <a href={page.link}>
              {page.linkLabel}
              <ArrowUpRight size={18} />
            </a>
          </motion.div> : <motion.div key="cover" className="identity-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={slowMotion({ duration: quiet ? 0 : 0.18 })}>
            <span className="identity-cover-index">THREE WAYS IN</span>
            <div className="identity-cover-name">Tianyi<br /><em>Chen.</em></div>
            <p>{t("学生、研究者、实践者。", "Student. Researcher. Practitioner.")}</p>
            <span>{t("选一个身份，翻开我的档案。", "Choose a role to open my file.")}</span>
          </motion.div>}
        </AnimatePresence>
        <span className="identity-stamp">{page?.stamp ?? "PERSONAL INDEX"}</span>
        <div className="identity-paper-bottom">
          <span>FROM SHIYAN</span>
          <span>BASED IN SUZHOU</span>
        </div>
      </motion.div>
      <a className="hero-pixel-ticket" href="#cosmos">
        <span className="ticket-pixel" aria-hidden="true">
          ↗
        </span>
        <span>
          QWEN / LoRA
          <br />
          <b>{t("我的研究记录", "My research records")}</b>
        </span>
        <ArrowUpRight size={16} />
      </a>
      <a className="hero-prototype-ticket" href="#mask">
        <span className="hero-system-icon" aria-hidden="true">
          <Workflow size={42} strokeWidth={1} />
        </span>
        <span>
          ONE PROTOTYPE.
          <br />
          <b>{t("我参与统筹与联调。", "I helped coordinate and integrate.")}</b>
        </span>
        <ArrowUpRight size={16} />
      </a>
    </motion.div>
  );
}

function Hero({ quiet }: { quiet: boolean }) {
  const { t, language } = useI18n();
  const heroRef = useRef<HTMLDivElement>(null);
  const entered = useInView(heroRef, { amount: 0.12 });
  return (
    <section id="home" className="chapter personal-hero">
      <div className="hero-grid" ref={heroRef}>
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="live-dot" /> A PERSONAL INDEX, 2026
          </div>
          <h1>
            <span
              className="hero-name-cn"
              aria-label={t("陈天一。", "Tianyi Chen.")}
            >
              {(language === "zh"
                ? ["陈", "天", "一", "。"]
                : ["Tianyi", "."]
              ).map((letter, index) => (
                <motion.span
                  aria-hidden="true"
                  className={
                    letter === "。" || letter === "."
                      ? "hero-name-dot"
                      : undefined
                  }
                  key={letter}
                  initial={
                    quiet ? false : { y: 32, opacity: 0, filter: "blur(6px)" }
                  }
                  animate={quiet || entered ? { y: 0, opacity: 1, filter: "blur(0px)" } : { y: 22, opacity: 0, filter: "blur(4px)" }}
                  transition={
                    slowMotion(quiet
                      ? { duration: 0 }
                      : {
                          duration: 0.75,
                          delay: index * 0.075,
                          ease: [0.16, 1, 0.3, 1],
                        })
                  }
                >
                  {letter}
                </motion.span>
              ))}
            </span>
            <motion.span
              className="hero-name-en"
              initial={quiet ? false : { clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: quiet || entered ? "inset(-12% -20% -18% -12%)" : "inset(0 100% 0 0)" }}
              transition={
                slowMotion(quiet
                  ? { duration: 0 }
                  : { duration: 1.05, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] })
              }
            >
              Choney
              <br />
              Chen
              <span className="hero-name-star" aria-hidden="true">
                ✳
              </span>
            </motion.span>
          </h1>
          <p className="hero-statement">
            {t("好奇心，", "Curiosity, ")}
            <span>{t("有下一步。", "with a next step.")}</span>
          </p>
          <p className="hero-bio">
            {t(
              "西交利物浦大学计算机科学与技术本科生。",
              "Computer Science and Technology undergraduate at XJTLU. ",
            )}
            <br />
            {t(
              "我研究视觉与空间感知，",
              "I study visual and spatial perception,",
            )}
            <br />
            {t(
              "也把 AI 做进环境数据和软硬件原型。",
              "and bring AI into environmental data and engineering prototypes.",
            )}
          </p>
          <p className="hero-basic-facts">
            BEng · Stage 4{" "}
            <span>{t("2023 — 2027（预计）", "2023 — 2027 (expected)")}</span>
          </p>
          <a className="hero-start" href="#origins">
            <span>
              {t("从我开始，慢慢往下看", "Start here. Follow the thread.")}
            </span>
            <ArrowDown size={18} />
          </a>
        </div>
        <IdentityFold quiet={quiet} entered={entered} />
      </div>
      <div className="hero-foot">
        <span>
          {t("湖北 · 十堰", "SHIYAN · HUBEI")}
          <span className="journey-line" />{" "}
          {t("江苏 · 苏州", "SUZHOU · JIANGSU")}
        </span>
        <span>RESEARCH / SYSTEMS / ENVIRONMENT</span>
        <span>
          SCROLL TO GET TO KNOW ME <ArrowDown size={13} />
        </span>
      </div>
    </section>
  );
}

const originIds = ["lif001", "kaiding", "surf-wearable"];

const originIcons = [
  <svg viewBox="0 0 240 100" key="chart" aria-hidden="true">
    <path
      d="M15 84H224M22 84V9"
      stroke="currentColor"
      fill="none"
      opacity=".3"
    />
    <path
      d="M30 72L65 60L96 65L127 40L160 47L205 20"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
    />
    {[
      [30, 72],
      [65, 60],
      [96, 65],
      [127, 40],
      [160, 47],
      [205, 20],
    ].map(([x, y]) => (
      <circle cx={x} cy={y} r="4" fill="currentColor" key={x} />
    ))}
  </svg>,
  <svg viewBox="0 0 240 100" key="system" aria-hidden="true">
    <path
      d="M55 48H115M115 48H181M115 48V78"
      stroke="currentColor"
      fill="none"
    />
    {[
      [20, 28],
      [84, 28],
      [150, 28],
      [84, 66],
    ].map(([x, y], i) => (
      <g key={x + y}>
        <rect
          x={x}
          y={y}
          width="62"
          height={i === 3 ? 24 : 40}
          rx="3"
          fill="none"
          stroke="currentColor"
        />
        <path
          d={`M${x + 12} ${y + 12}h24m-24 8h38`}
          stroke="currentColor"
          opacity=".5"
        />
      </g>
    ))}
  </svg>,
  <svg viewBox="0 0 240 100" key="signal" aria-hidden="true">
    <path
      d="M10 50H35L40 35L48 69L56 19L66 80L73 45L84 50H117L128 37L136 59L145 22L155 79L162 41L173 50H225"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M10 85H225" fill="none" stroke="currentColor" opacity=".25" />
  </svg>,
];

function Origins({ quiet }: { quiet: boolean }) {
  const { t } = useI18n();
  const { experienceTimeline } = useContent();
  const originNames = [t("食堂回归分析", "Canteen regression"), t("凯鼎 IT 实习", "Kaiding IT internship"), t("SURF 可穿戴研究", "SURF wearable research")];
  const [selected, setSelected] = useState<number | null>(null);
  useCollapseOnLeave("origins", () => setSelected(null));
  const bank = useRef<HTMLDivElement>(null);
  const entered = useInView(bank, { amount: 0.2 });
  const selectedExperience = selected === null ? null : experienceTimeline.find(item => item.id === originIds[selected]);
  return (
    <section id="origins" className="chapter origins-chapter" aria-labelledby="origins-title">
      <div className="chapter-inner">
        <header className="origins-heading">
          <div><p className="chapter-kicker">01 / THE BEGINNINGS</p><h2 id="origins-title">{t("从具体的", "It began with")}<br /><span>{t("问题开始。", "small questions.")}</span></h2></div>
          <p>{t("回归分析、软件维护、可穿戴数据采集。", "Regression. Software maintenance. Wearable data.")}<br />{t("我的三段早期经历。", "Three early experiences that shaped my work.")}</p>
        </header>
        <div className="origin-desk">
          <div className="origin-file-bank" ref={bank}>
            <div className="origin-folder-back" aria-hidden="true" />
            <div className="origin-paper-slots" role="tablist" aria-label={t("我的早期经历文件", "Files from my early experiences")} onKeyDown={event => cycleTabs(event, selected ?? 0, originIds.length, setSelected)}>
              {originIds.map((id, index) => {
                const item = experienceTimeline.find(entry => entry.id === id)!;
                return <motion.div key={id} className="origin-paper-slot" initial={quiet ? false : { y: 58, opacity: 0 }} animate={{ y: quiet || entered ? 0 : 58, opacity: quiet || entered ? 1 : 0 }} transition={slowMotion({ duration: quiet ? 0 : 0.7, delay: quiet ? 0 : index * 0.09, ease: [0.16, 1, 0.3, 1] })}>
                  <motion.button role="tab" aria-selected={index === selected} aria-expanded={index === selected} tabIndex={selected === index || (selected === null && index === 0) ? 0 : -1} aria-controls="origin-record" id={`origin-tab-${index}`} className={`origin-file origin-file-${index} ${selected === index ? "is-open" : ""}`}
                    onClick={() => setSelected(selected === index ? null : index)}
                    drag={!quiet ? "y" : false} dragConstraints={{ top: -62, bottom: 0 }} dragElastic={0.08} dragSnapToOrigin dragTransition={slowDragRelease}
                    onDragEnd={(_, info) => { if (info.offset.y < -20) setSelected(index); }}
                    animate={{ y: selected === index ? -48 : 0, rotate: quiet ? 0 : [-4, 1, 5][index] }} transition={slowMotion(quiet ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 26 })}>
                    <span className="origin-tab-label">FILE 0{index + 1}</span><span className="origin-file-date">{item.year}</span><h3>{originNames[index]}</h3>
                    <div className="origin-file-drawing">{originIcons[index]}</div>
                  </motion.button>
                </motion.div>;
              })}
            </div>
            <div className="origin-folder-front" aria-hidden="true"><span>CHONEY’S EARLY FILES<small>2023 — 2025</small></span></div>
            <p className="origin-pull-hint">{t("向上抽出 · 或点击文件", "Pull a file up · or click to read")} <ArrowUpRight size={15} /></p>
          </div>
          <div className="origin-reading-slot">
            <AnimatePresence mode="wait" initial={false}>
              {selectedExperience && selected !== null ? <motion.article id="origin-record" className="origin-record" role="tabpanel" aria-labelledby={`origin-tab-${selected}`} key={selectedExperience.id} initial={{ opacity: 0, x: quiet ? 0 : -16, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, x: 0, clipPath: "inset(0 0% 0 0)" }} exit={{ opacity: 0, x: quiet ? 0 : 10 }} transition={slowMotion({ duration: quiet ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] })}>
                <div className="origin-record-top"><span className="record-number">RECORD / 0{selected + 1}</span><button className="reading-close" onClick={() => setSelected(null)} aria-label={t("合上经历文件", "Close experience file")}><X size={17} /></button></div>
                {selected === 1 ? <SteampunkWork quiet={quiet} /> : <><h3>{selectedExperience.title}</h3><p className="record-role">{selectedExperience.role}</p><p>{selectedExperience.description}</p><div className="record-tags">{selectedExperience.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{selectedExperience.boundary && <details className="support-notes"><summary>{t("记录说明", "Record context")}</summary><p>{selectedExperience.boundary}</p></details>}</>}
              </motion.article> : <motion.div key="closed" className="origin-closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><span>2023 — 2025</span><h3>{t("三个起点，", "Three beginnings,")}<br />{t("同一份好奇。", "one curiosity.")}</h3><p>{t("抽出一份文件，读我的实际工作。", "Open a file to read what I worked on.")}</p></motion.div>}
            </AnimatePresence>
          </div>
        </div>
        <a className="chapter-link origins-next" href="#methods">{t("接下来：我的做事方式", "Next: how I approach the work")}<ArrowRight size={18} /></a>
      </div>
    </section>
  );
}

function PersonalArchive({ quiet }: { quiet: boolean }) {
  const { t } = useI18n();
  const { experienceTimeline } = useContent();
  const [year, setYear] = useState("all");
  const [open, setOpen] = useState("");
  useCollapseOnLeave("archive", () => setOpen(""));
  const items = experienceTimeline.filter(
    (item) => year === "all" || item.year.includes(year),
  );
  return (
    <section id="archive" className="chapter archive-chapter">
      <div className="chapter-inner">
        <div className="archive-heading">
          <div>
            <p className="chapter-kicker">11 / MY PERSONAL ALMANAC</p>
            <h2>
              {t("这些事，", "Every experience,")}
              <br />
              {t("都让我成为我。", "a part of who I am.")}
            </h2>
          </div>
          <div className="archive-note">
            <span className="archive-count">
              15<span>RECORDS</span>
            </span>
            <p>
              {t(
                "课程、实习、研究、原型与团队。",
                "Courses, internships, research, prototypes, and teams.",
              )}
              <br />
              {t(
                "有些已完成，有些还在生长。",
                "Some completed. Some still growing.",
              )}
            </p>
          </div>
        </div>
        <div
          className="archive-filter"
          role="group"
          aria-label={t("按年份浏览个人经历", "Browse my experiences by year")}
        >
          {["all", "2023", "2024", "2025", "2026"].map((item) => (
            <button
              key={item}
              aria-pressed={year === item}
              onClick={() => setYear(item)}
            >
              {item === "all" ? t("全部", "All") : item}
              {year === item && <span>↗</span>}
            </button>
          ))}
          <span>SELECT A YEAR / OPEN A RECORD</span>
        </div>
        <div className="archive-records">
          {items.map((item, index) => (
            <motion.article
              layout={!quiet}
              key={item.id}
              className={`archive-ticket ${open === item.id ? "is-open" : ""}`}
              initial={quiet ? false : { opacity: 0, x: index % 2 ? 28 : -28 }}
              animate={quiet ? { opacity: 1, x: 0 } : undefined}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={
                slowMotion(quiet
                  ? { duration: 0 }
                  : {
                      duration: 0.55,
                      delay: (index % 3) * 0.045,
                      ease: [0.16, 1, 0.3, 1],
                    })
              }
            >
              <button
                className="archive-ticket-button"
                aria-expanded={open === item.id}
                aria-controls={`record-${item.id}`}
                onClick={() => setOpen(open === item.id ? "" : item.id)}
              >
                <span className="archive-year">{item.id === "can201" ? "2025" : item.year}</span>
                <span className="archive-title">
                  {item.title}
                  <small>{item.role}</small>
                </span>
                <span className="archive-status">{item.status}</span>
                {open === item.id ? <Minus size={19} /> : <Plus size={19} />}
              </button>
              <AnimatePresence initial={false}>
                {open === item.id && (
                  <ReadingReveal
                    id={`record-${item.id}`}
                    className="archive-ticket-body"
                    initial={{ gridTemplateRows: "0fr", opacity: 0 }}
                    animate={{ gridTemplateRows: "1fr", opacity: 1 }}
                    exit={{ gridTemplateRows: "0fr", opacity: 0 }}
                    transition={slowMotion({ duration: quiet ? 0 : 0.28 })}
                  >
                    <div
                      className={
                        item.id === "education"
                          ? "archive-education-body"
                          : undefined
                      }
                    >
                      {item.id === "education" ? (
                        <RomanEducation quiet={quiet} />
                      ) : (
                        <>
                          <p>{item.description}</p>
                          {item.boundary && <small>{item.boundary}</small>}
                          {item.projectId && (
                            <a href={`#${item.projectId}`}>
                              {t(
                                "进入这段经历的专属章节",
                                "Explore this experience’s chapter",
                              )}
                              <ArrowUpRight size={15} />
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </ReadingReveal>
                )}
              </AnimatePresence>
            </motion.article>
          ))}
        </div>
        <details className="archive-footnote support-notes"><summary>{t("关于这份经历索引", "About this index")}</summary><p>
          {t(
            "地下停车场 SURF 与 Cosmos-Loc 存在工作重叠；面罩竞赛是同一原型的后续成果。这里保留经历脉络，不重复计算项目成果。",
            "The car-park SURF overlaps with Cosmos-Loc; the maker competition is a later result of the same mask prototype. These records preserve the timeline without counting the same achievement twice.",
          )}
        </p></details>
      </div>
    </section>
  );
}

function PersonalFooter() {
  const { t } = useI18n();
  return (
    <div className="personal-footer-wrap">
      <footer className="site-footer">
        <a href="#home">
          {t("CHONEY CHEN / 陈天一", "CHONEY CHEN / TIANYI CHEN")}
        </a>
        <span>
          {t(
            "从十堰到苏州。从好奇到下一步。",
            "From Shiyan to Suzhou. From curiosity to a next step.",
          )}
        </span>
        <a
          href="https://github.com/ChoneyChen/ChoneyChen.github.io"
          target="_blank"
          rel="noreferrer"
        >
          SOURCE ↗
        </a>
        <span>© 2026</span>
      </footer>
    </div>
  );
}

// Scroll navigation can update its label without rebuilding every chapter.
// A language context change still reaches the chapter components normally.
const MainChapters = memo(function MainChapters({ quiet }: { quiet: boolean }) {
  return (
    <main>
      <Hero quiet={quiet} />
      <Origins quiet={quiet} />
      <MethodsChapter quiet={quiet} />
      <ResearchDirections quiet={quiet} />
      <CosmosChapter quiet={quiet} />
      <SupsChapter quiet={quiet} />
      <MaskChapter quiet={quiet} />
      <ESGChapter quiet={quiet} />
      <FutureChapter quiet={quiet} />
      <ToolsChapter quiet={quiet} />
      <PersonalArchive quiet={quiet} />
      <PersonalPortrait quiet={quiet} />
      <ContactChapter quiet={quiet} />
      <PersonalFooter />
    </main>
  );
});

export default function App() {
  const { t, language, setLanguage } = useI18n();
  const chapters = getChapters(t);
  const systemQuiet = useReducedMotion();
  const [manualQuiet, setManualQuiet] = useState(false);
  const quiet = manualQuiet || Boolean(systemQuiet);
  const [menuOpen, setMenuOpen] = useState(false);
  useChapterAnchors();
  useReadingExit(!menuOpen);
  useChapterSnap({ enabled: !menuOpen, reduced: quiet });
  const [active, setActive] = useState("home");
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuContainer = useRef<HTMLDivElement>(null);
  const readingAnchor = useRef<{ id: string; top: number } | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, slowSpring({
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
    restSpeed: 0.01,
  }));
  const activeIndex = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.id === active),
  );

  function switchLanguage() {
    const section = document.getElementById(active);
    if (section)
      readingAnchor.current = {
        id: active,
        top: section.getBoundingClientRect().top,
      };
    setLanguage(language === "en" ? "zh" : "en");
  }

  useLayoutEffect(() => {
    const snapshot = readingAnchor.current;
    if (!snapshot) return;
    const section = document.getElementById(snapshot.id);
    if (section)
      window.scrollBy({
        top: section.getBoundingClientRect().top - snapshot.top,
        behavior: "instant",
      });
    readingAnchor.current = null;
  }, [language]);

  useEffect(() => {
    const elements = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-18% 0px -70% 0px", threshold: 0 },
    );
    elements.forEach((element) => observer.observe(element));
    const hash = location.hash.startsWith("#project/")
      ? location.hash.replace("#project/", "")
      : location.hash.slice(1);
    if (location.hash.startsWith("#project/")) {
      history.replaceState(null, "", `#${hash}`);
    }
    // The SPA's sections become available after the browser's first hash lookup.
    const initialAnchor = requestAnimationFrame(() => {
      if (hash)
        document.getElementById(hash)?.scrollIntoView({ behavior: "instant" });
    });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(initialAnchor);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuContainer.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const elements =
          menuContainer.current?.querySelectorAll<HTMLElement>("a,button");
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <MotionConfig
      reducedMotion={quiet ? "always" : "user"}
      transition={quiet ? quietTransition : presentationTransition}
    >
      <div className="personal-site" data-quiet={quiet} style={motionTimingStyle}>
        <a href="#home" className="skip-link">
          {t("跳到个人介绍", "Skip to my introduction")}
        </a>
        <header className="site-header">
          <a className="site-wordmark" href="#home">
            CHONEY<span>{t("陈天一", "Tianyi Chen")}</span>
          </a>
          <span className="site-location">
            <span>{String(activeIndex).padStart(2, "0")}</span>
            {chapters[activeIndex].label}
          </span>
          <div className="header-actions">
            <button
              className="language-toggle"
              onClick={switchLanguage}
              aria-label={t("切换至英文", "Switch to Chinese")}
              title={t("切换至英文", "Switch to Chinese")}
            >
              <span className={language === "en" ? "is-active" : ""}>EN</span>
              <span className="language-slash">/</span>
              <span className={language === "zh" ? "is-active" : ""}>ZH</span>
            </button>
            <button
              className="quiet-toggle"
              aria-pressed={quiet}
              aria-label={t("切换轻动态", "Toggle reduced motion")}
              onClick={() => setManualQuiet(!manualQuiet)}
              title={
                systemQuiet
                  ? t(
                      "系统已启用减少动态",
                      "Reduced motion is enabled in your system",
                    )
                  : t("切换轻动态", "Toggle reduced motion")
              }
            >
              {quiet ? <Check size={14} /> : <Layers size={14} />}
              <span>{t("轻动态", "Less motion")}</span>
            </button>
            <button
              className="directory-toggle"
              ref={menuButton}
              aria-expanded={menuOpen}
              aria-controls="site-directory"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? t("关闭", "Close") : t("浏览目录", "Directory")}
              {menuOpen ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>
          <motion.div
            className="site-scroll-progress"
            style={{ scaleX: progress }}
          />
        </header>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="site-directory"
              className="site-directory"
              ref={menuContainer}
              role="dialog"
              aria-modal="true"
              aria-label={t(
                "个人主页章节目录",
                "Personal homepage chapter directory",
              )}
              initial={quiet ? false : { clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={
                slowMotion(quiet
                  ? { duration: 0 }
                  : { duration: 0.5, ease: [0.16, 1, 0.3, 1] })
              }
            >
              <div className="directory-intro">
                <p>{t("不是只有一种样子。", "More than one perspective.")}</p>
                <h2>
                  {t("选择一条线索，", "Follow a thread,")}
                  <br />
                  {t("认识陈天一。", "get to know Tianyi.")}
                </h2>
                <span>
                  {t(
                    "顺着往下读，也可以从任意一章开始。",
                    "Read in sequence, or begin at any chapter.",
                  )}
                </span>
              </div>
              <nav aria-label={t("全部个人主页章节", "All homepage chapters")}>
                {chapters.map((chapter, index) => (
                  <a
                    href={`#${chapter.id}`}
                    key={chapter.id}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="directory-number">
                      {String(index).padStart(2, "0")}
                    </span>
                    <span
                      className="directory-dot"
                      style={{ background: chapter.colour }}
                    />
                    <span>
                      {chapter.caption}
                      <small>{chapter.style}</small>
                    </span>
                    <ArrowUpRight size={20} />
                  </a>
                ))}
              </nav>
              <button
                className="directory-close"
                onClick={() => {
                  setMenuOpen(false);
                  menuButton.current?.focus();
                }}
              >
                {t("返回当前阅读", "Return to reading")}
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <MainChapters quiet={quiet} />
        <nav
          className="chapter-rail"
          aria-label={t("浏览主轴", "Main browsing thread")}
        >
          <a
            className="rail-previous"
            aria-label={t("上一章", "Previous chapter")}
            href={`#${chapters[Math.max(0, activeIndex - 1)].id}`}
          >
            <ChevronLeft size={17} />
          </a>
          <div className="rail-stops">
            {chapters.map((chapter, index) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                aria-current={active === chapter.id ? "location" : undefined}
                title={chapter.caption}
              >
                <span className="rail-stop-dot" />
                <span className="rail-stop-label">{chapter.label}</span>
                <span className="rail-stop-number">
                  {String(index).padStart(2, "0")}
                </span>
              </a>
            ))}
          </div>
          <span className="rail-mobile-label">
            {String(activeIndex).padStart(2, "0")} /{" "}
            {chapters[activeIndex].label}
          </span>
          <a
            className="rail-next"
            aria-label={t("下一章", "Next chapter")}
            href={`#${chapters[Math.min(chapters.length - 1, activeIndex + 1)].id}`}
          >
            <ChevronRight size={17} />
          </a>
        </nav>
      </div>
    </MotionConfig>
  );
}
