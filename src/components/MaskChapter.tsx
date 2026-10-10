import { ReadingReveal } from "./ReadingReveal";
import { slowMotion } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Layers3,
  Plus,
  Radio,
  ScanLine,
  Thermometer,
  Workflow,
  X,
} from "lucide-react";
import { useI18n } from "../i18n";
import "./mask-chapter.css";

type Translate = (zh: string, en: string) => string;
const makeStages = (t: Translate) => [
  {
    number: "01",
    title: t(
      "视觉，进入控制链路。",
      "Vision into control.",
    ),
    short: t("视觉与软件", "Vision & software"),
    icon: ScanLine,
    text: t(
      "参与摄像头采集、视觉模型与控制参数转换，将分析结果连接到触屏界面、FastAPI 后端及 SQLite 本地记录。",
      "Helped connect camera input and visual-model analysis to structured control parameters, a touchscreen interface, the FastAPI backend and SQLite records.",
    ),
    detail: t(
      "视觉分析 → 结构化参数 → 本地软件",
      "Visual analysis → structured parameters → local software",
    ),
    label: t("分析 / 参数 / 接口", "ANALYSIS / PARAMETERS / INTERFACES"),
  },
  {
    number: "02",
    title: t("软件，接上硬件。", "Software meets hardware."),
    short: t("无线与嵌入式", "Wireless & embedded"),
    icon: Radio,
    text: t(
      "参与主控制器与无线设备的通信及跨模块联调，连接光源和加热模块的控制逻辑。",
      "Contributed to controller-to-device communication and integration across modules, connecting light and heating control logic.",
    ),
    detail: t(
      "Raspberry Pi → ESP32-S3 → LED / 加热",
      "Raspberry Pi → ESP32-S3 → LED / heating",
    ),
    label: "Raspberry Pi / ESP32-S3",
  },
  {
    number: "03",
    title: t(
      "反馈，闭合控制回路。",
      "Feedback closes the loop.",
    ),
    short: t("控制与反馈", "Control & feedback"),
    icon: Thermometer,
    text: t(
      "参与 HC-SR04 距离传感器、DS18B20 温度传感器与设备状态的联调，检查异常检测及停止条件。",
      "Helped integrate HC-SR04 distance sensing, DS18B20 temperature sensing and device-status feedback, checking fault detection and stopping conditions.",
    ),
    detail: t(
      "传感数据 → 状态检查 → 停止条件",
      "Sensor readings → status checks → stopping conditions",
    ),
    label: t("距离 / 温度 / 状态", "DISTANCE / TEMPERATURE / STATUS"),
  },
  {
    number: "04",
    title: t("团队，共同交付原型。", "The team’s working prototype."),
    short: t("统筹与交付", "Coordination & delivery"),
    icon: Workflow,
    text: t(
      "统筹团队分工、进度与阶段测试，协调 AI、软件、嵌入式和硬件的整合，并参与原型建模、装配及交付。",
      "Coordinated responsibilities, progress and staged testing across AI, software, embedded and hardware work, contributing to prototype modelling, assembly and delivery.",
    ),
    detail: t(
      "分工 → 联调 → 可演示原型",
      "Responsibilities → integration → working prototype",
    ),
    label: t("分工 / 联调 / 交付", "RESPONSIBILITIES / INTEGRATION / DELIVERY"),
  },
];

const makeConnections = (t: Translate) => [
  {
    number: "01",
    name: t("视觉分析", "Visual analysis"),
    label: "VISUAL",
    stage: 0,
  },
  {
    number: "02",
    name: t("结构化参数", "Control parameters"),
    label: "PARAMETERS",
    stage: 0,
  },
  {
    number: "03",
    name: t("软件界面 / 本地后端", "Interface / local backend"),
    label: "LOCAL SOFTWARE",
    stage: 0,
  },
  {
    number: "04",
    name: "ESP32-S3",
    label: "WIRELESS",
    stage: 1,
  },
  {
    number: "05",
    name: t("LED / 加热", "LED / heating"),
    label: "ACTION",
    stage: 1,
  },
  {
    number: "06",
    name: t("传感反馈", "Sensor feedback"),
    label: "FEEDBACK",
    stage: 2,
  },
];

export function MaskChapter({ quiet = false }: { quiet?: boolean }) {
  const { t, language } = useI18n();
  const stages = makeStages(t);
  const connections = makeConnections(t);
  const prefersQuiet = useReducedMotion();
  const lowMotion = quiet || Boolean(prefersQuiet);
  const storyRef = useRef<HTMLDivElement>(null);
  const entered = useInView(storyRef, { once: false, amount: "some" });
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useCollapseOnLeave("mask", () => setExpanded(false));
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start 70%", "end 65%"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [7, -7]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (expanded) return;
    const next = Math.max(
      0,
      Math.min(stages.length - 1, Math.floor(value * stages.length)),
    );
    setActive((previous) => (previous === next ? previous : next));
  });

  const CurrentIcon = stages[active].icon;
  const drawn = entered || lowMotion;
  const interfacePaths = [
    "M240 82H360 M465 124V137Q465 150 452 150H345V162",
    "M300 241V249Q300 263 286 263H150V282 M240 316H360",
    "M465 361V370Q465 384 451 384H345V389 M162 426H38Q24 426 24 412V213Q24 199 38 199H162",
    "M240 82H360 M465 124V137Q465 150 452 150H345V162 M300 241V249Q300 263 286 263H150V282 M240 316H360 M465 361V370Q465 384 451 384H345V389",
  ];

  return (
    <section
      id="mask"
      lang={language}
      className={`chapter mask-chapter${lowMotion ? " is-quiet" : ""}`}
      aria-labelledby="mask-title"
    >
      <div className="chapter-inner mask-inner">
        <header className="mask-heading">
          <p className="chapter-kicker">{t("06 / 从模块到系统", "06 / BUILDING A SYSTEM")}</p>
          <p className="mask-eyebrow">
            {t(
              "工程原型 · MEC202 · 2026.03 — 2026.07",
              "ENGINEERING PROTOTYPE · MEC202 · 2026.03 — 2026.07",
            )}
          </p>
          <h2 id="mask-title">
            {t("智能光疗", "Intelligent")}
            <br />
            <span>{t("面罩系统", "Phototherapy Mask")}</span>
          </h2>
          <div className="mask-introduction">
            <p>
              {t(
                "怎样将面部视觉分析，接入带传感反馈的硬件控制？",
                "How can facial visual analysis become hardware control with sensor feedback?",
              )}
            </p>
            <span className="mask-role-mark">
              <span />
              {t("团队组长 · 系统整合 · 原型已交付", "Team leader · system integration · prototype delivered")}
            </span>
          </div>
        </header>

        <div className="mask-story-layout" ref={storyRef} data-entry-state={drawn ? "connected" : "reset"}>
          <div className="mask-product-column">
            <div
              className={`mask-product-stage${expanded ? " is-expanded" : ""}`}
            >
              <div className="mask-stage-topline">
                <span>{t("系统连接", "SYSTEM CONNECTIONS")}</span>
                <span>{t("团队工程原型", "TEAM ENGINEERING PROTOTYPE")}</span>
              </div>
              <div className="mask-connection-visual">
                <motion.div
                  className={`mask-connection-board${active === 3 ? " is-integrating" : ""}`}
                  style={{ y: lowMotion ? 0 : y }}
                >
                  <svg
                    className="mask-connection-lines"
                    viewBox="0 0 600 470"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <marker
                        id="mask-arrow"
                        markerWidth="6"
                        markerHeight="6"
                        refX="5"
                        refY="3"
                        orient="auto"
                      >
                        <path d="M0 0L6 3L0 6" fill="#9eafd2" />
                      </marker>
                    </defs>
                    {[
                      "M240 82H360",
                      "M465 124V137Q465 150 452 150H345V162",
                      "M300 241V249Q300 263 286 263H150V282",
                      "M240 316H360",
                      "M465 361V370Q465 384 451 384H345V389",
                      "M162 426H38Q24 426 24 412V213Q24 199 38 199H162",
                    ].map((path, index) => (
                      <motion.path
                        key={path}
                        d={path}
                        className={
                          index === 5 ? "mask-feedback-line" : undefined
                        }
                        initial={
                          lowMotion ? false : { pathLength: 0, opacity: 0 }
                        }
                        animate={{
                          pathLength: drawn ? 1 : 0,
                          opacity: drawn ? 1 : 0,
                        }}
                        transition={slowMotion({
                          duration: lowMotion ? 0 : drawn ? 0.55 : 0.4,
                          delay: lowMotion ? 0 : drawn ? index * 0.06 : (5 - index) * 0.055,
                          ease: "easeInOut",
                        })}
                      />
                    ))}
                    {drawn && !lowMotion && (
                      <motion.path
                        d={interfacePaths[active]}
                        className="mask-interface-pulse"
                        initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
                        animate={{
                          pathLength: [0, 0.22, 0.22, 0],
                          pathOffset: [0, 0.2, 0.75, 1],
                          opacity: [0, 1, 1, 0],
                        }}
                        transition={slowMotion({
                          duration: 1.05,
                          delay: 0.12,
                          ease: "easeInOut",
                          times: [0, 0.25, 0.8, 1],
                        })}
                      />
                    )}
                  </svg>
                  {connections.map((connection, index) => (
                    <motion.button
                      key={connection.number}
                      type="button"
                      className={`mask-connection-node mask-connection-node-${index + 1}${active === connection.stage || active === 3 ? " is-current" : ""}`}
                      initial={
                        lowMotion
                          ? false
                          : {
                              opacity: 0,
                              y: 23,
                              scale: 0.94,
                              clipPath: "inset(0 0 80% 0)",
                            }
                      }
                      animate={{
                        opacity: drawn ? 1 : 0,
                        y: drawn ? 0 : 23,
                        scale: drawn ? 1 : 0.94,
                        clipPath: drawn
                          ? "inset(0 0 0% 0)"
                          : "inset(0 0 80% 0)",
                      }}
                      transition={slowMotion({
                        duration: lowMotion ? 0 : drawn ? 0.55 : 0.42,
                        delay: lowMotion ? 0 : drawn ? index * 0.06 : 0.04 + (connections.length - 1 - index) * 0.035,
                        ease: [0.22, 1, 0.36, 1],
                      })}
                      aria-label={`${connection.name}: ${t("查看我参与的工作", "read about my contribution")}`}
                      onClick={() => {
                        setActive(connection.stage);
                        setExpanded(true);
                      }}
                    >
                      <small>
                        {connection.number} / {connection.label}
                      </small>
                      <strong>{connection.name}</strong>
                    </motion.button>
                  ))}
                  <span className="mask-feedback-label">
                    {t("反馈回到软件", "Feedback to software")}
                  </span>
                </motion.div>
                <p className="mask-diagram-note">
                  {t(
                    "软件、控制与反馈的连接示意",
                    "Software, control and feedback connections",
                  )}
                </p>
              </div>

              <div className="mask-system-header">
                <div>
                  <CurrentIcon size={19} strokeWidth={1.5} />
                  <span>{stages[active].short}</span>
                </div>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls="mask-system-chain"
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded
                    ? t("收起系统链路", "Close system details")
                    : t("展开系统链路", "Explore system details")}
                  {expanded ? <X size={16} /> : <Plus size={16} />}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {expanded && (
                  <ReadingReveal
                    id="mask-system-chain"
                    className="mask-system-chain"
                    initial={{ gridTemplateRows: "0fr", opacity: 0 }}
                    animate={{ gridTemplateRows: "1fr", opacity: 1 }}
                    exit={{ gridTemplateRows: "0fr", opacity: 0 }}
                    transition={slowMotion({ duration: lowMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] })}
                  >
                    <p className="mask-chain-caption">
                      <Layers3 size={14} />
                      {t(
                        "选择环节，查看本人工作",
                        "Choose a stage to read my work",
                      )}
                    </p>
                    <div className="mask-chain-nodes">
                      {stages.map((stage, index) => {
                        const Icon = stage.icon;
                        return (
                          <button
                            key={stage.number}
                            type="button"
                            aria-pressed={active === index}
                            onClick={() => setActive(index)}
                          >
                            <Icon size={22} strokeWidth={1.4} />
                            <span>{stage.short}</span>
                            <small>{stage.number}</small>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mask-chain-work" aria-live="polite">
                      <strong>{stages[active].detail}</strong>
                      <p>{stages[active].text}</p>
                    </div>
                  </ReadingReveal>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mask-narrative">
            <div className="mask-narrative-intro">
              <ArrowDown size={17} />
              <span>
                {t(
                  "四项本人工作",
                  "FOUR AREAS OF MY WORK",
                )}
              </span>
            </div>
            {stages.map((stage, index) => (
              <button
                type="button"
                className={`mask-story-step${active === index ? " is-current" : ""}`}
                key={stage.number}
                aria-expanded={expanded && active === index}
                aria-controls="mask-system-chain"
                onClick={() => {
                  setActive(index);
                  setExpanded((current) => active === index ? !current : true);
                }}
              >
                <span className="mask-step-number">{stage.number}</span>
                <strong className="mask-step-title">{stage.title}</strong>
                <div className="mask-step-label">{stage.label}</div>
                <span className="mask-step-action">{expanded && active === index ? t("收起", "Close") : t("我的工作", "My work")} <ArrowUpRight size={13} /></span>
              </button>
            ))}
          </div>
        </div>

        <div className="mask-outcomes">
          <div className="mask-outcome-grade">
            <span>{t("MEC202 / 课程成绩", "MEC202 / COURSE GRADE")}</span>
            <strong>79</strong>
            <p>
              {t("工程课程项目", "Engineering course project")}
            </p>
          </div>
          <div className="mask-outcome-award">
            <span>
              {t("2026 / 团队竞赛成果", "2026 / TEAM COMPETITION RESULT")}
            </span>
            <strong>
              {t("优秀奖", "Excellence Award")}
              <span>
                <Check size={26} strokeWidth={1.2} />
              </span>
            </strong>
            <p>
              {t("中美青年创客大赛", "China–US Young Maker Competition")}
              <br />
              {t("苏州选拔赛主赛道", "Suzhou selection · main track")}
            </p>
          </div>
          <div className="mask-outcome-reflection">
            <span>{t("课程后的推进", "AFTER THE COURSE")}</span>
            <p>
              {t("继续完善原型，", "Refine the prototype.")}
              <br />
              {t(
                "准备竞赛展示。",
                "Prepare the competition demo.",
              )}
            </p>
            <details className="mask-project-scope">
              <summary>{t("原型范围", "Prototype scope")}</summary>
              <p>{t(
                "团队工程原型，用于展示系统集成与控制思路；无临床疗效或医疗认证声明。",
                "A team engineering prototype for system integration and control, without claims of clinical efficacy or medical certification.",
              )}</p>
            </details>
          </div>
        </div>
        <footer className="mask-footer">
          <a
            className="chapter-link"
            href="https://github.com/ChoneyChen/XJTLU_MEC202_25-26_IND3G2_Vision-Model-Based-Intelligent-Phototherapy-Mask-System"
            target="_blank"
            rel="noreferrer"
          >
            {t("查看项目公开代码", "View the project code")}{" "}
            <ArrowUpRight size={17} />
          </a>
          <a className="chapter-link" href="#esg">
            {t("下一段实践：环境 AI 与数据", "Next: environmental AI & data")}{" "}
            <ArrowDown size={17} />
          </a>
        </footer>
      </div>
    </section>
  );
}
