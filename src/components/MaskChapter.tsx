import { ReadingReveal } from "./ReadingReveal";
import { slowMotion } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
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
    title: t("视觉分析与本地软件", "Vision & local software"),
    short: t("视觉与软件", "Vision & software"),
    icon: ScanLine,
    text: t(
      "参与摄像头采集、视觉模型与控制参数转换，并参与触屏界面、FastAPI 后端和 SQLite 本地记录的开发，连接视觉分析与本地软件。",
      "Helped connect camera input and visual-model analysis to structured control parameters. Contributed to the touchscreen interface, FastAPI backend and SQLite records supporting the local software.",
    ),
    detail: t(
      "视觉分析 → 结构化参数 → 本地软件",
      "Visual analysis → structured parameters → local software",
    ),
    label: t("分析 / 参数 / 接口", "ANALYSIS / PARAMETERS / INTERFACES"),
  },
  {
    number: "02",
    title: t("无线通信与嵌入式控制", "Wireless & embedded control"),
    short: t("无线与嵌入式", "Wireless & embedded"),
    icon: Radio,
    text: t(
      "参与 Raspberry Pi 与 ESP32-S3 的通信及跨模块联调，将本地软件连接到光源和加热设备的控制逻辑。",
      "Contributed to communication between Raspberry Pi and ESP32-S3. Helped connect local software to wireless devices and integrate LED and heating control logic across modules.",
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
      "传感反馈与停止条件",
      "Feedback & stopping conditions",
    ),
    short: t("控制与反馈", "Control & feedback"),
    icon: Thermometer,
    text: t(
      "参与 HC-SR04 距离传感器、DS18B20 温度传感器和设备状态反馈的联调，在跨模块测试中检查异常检测与停止条件。",
      "Helped integrate HC-SR04 distance sensing, DS18B20 temperature sensing and device-status feedback. Checked fault detection and stopping conditions during cross-module testing of the team prototype.",
    ),
    detail: t(
      "传感数据 → 状态检查 → 停止条件",
      "Sensor readings → status checks → stopping conditions",
    ),
    label: t("距离 / 温度 / 状态", "DISTANCE / TEMPERATURE / STATUS"),
  },
  {
    number: "04",
    title: t("团队统筹与原型交付", "Coordination & prototype delivery"),
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
  const activeRef = useRef(active);
  activeRef.current = active;
  const [expanded, setExpanded] = useState(false);
  useCollapseOnLeave("mask", () => { setExpanded(false); setActive(0); });

  const CurrentIcon = stages[active].icon;
  const drawn = entered || lowMotion;
  const connectionPaths = [
    "M240 82H360",
    "M465 124V137Q465 150 452 150H345V162",
    "M300 241V249Q300 263 286 263H150V282",
    "M240 316H360",
    "M465 361V370Q465 384 451 384H345V389",
    "M162 426H38Q24 426 24 412V213Q24 199 38 199H162",
  ];
  const pathStages = [0, 0, 1, 1, 2, 2];
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start 70%", "end 65%"] });
  const scrollStage = (progress: number) => Math.min(stages.length - 1, Math.max(0, Math.floor(progress * stages.length)));
  // Read native scroll only. React changes at the four semantic boundaries,
  // never to animate a scroll position or override an open reading layer.
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (expanded || lowMotion || !drawn) return;
    const next = scrollStage(progress);
    if (activeRef.current === next) return;
    activeRef.current = next;
    setActive(next);
  });
  useEffect(() => {
    if (!drawn) { setActive(0); return; }
    if (expanded || lowMotion) return;
    const next = scrollStage(scrollYProgress.get());
    if (activeRef.current === next) return;
    activeRef.current = next;
    setActive(next);
  }, [expanded, drawn, lowMotion, scrollYProgress]);

  return (
    <section
      id="mask"
      lang={language}
      className={`chapter mask-chapter${lowMotion ? " is-quiet" : ""}`}
      aria-labelledby="mask-title"
    >
      <div className="chapter-inner mask-inner">
        <header className="mask-heading">
          <p className="chapter-kicker">{t("06 / 智能光疗面罩系统", "06 / INTELLIGENT PHOTOTHERAPY MASK SYSTEM")}</p>
          <p className="mask-eyebrow">
            {t(
              "工程原型 · 2026.03 — 2026.07",
              "ENGINEERING PROTOTYPE · 2026.03 — 2026.07",
            )}
          </p>
          <h2 id="mask-title" className="project-title">
            {t("基于视觉模型的", "Vision-Model-Based Intelligent")}
            {" "}<span>{t("智能光疗面罩系统", "Phototherapy Mask System")}</span>
          </h2>
          <div className="mask-introduction">
            <p className="project-summary">
              {t(
                "将视觉分析、本地软件与传感反馈连接起来，交付可演示的软硬件系统原型。",
                "Connecting visual analysis, local software and sensor feedback in a demonstrable system prototype spanning software and embedded hardware.",
              )}
            </p>
            <span className="mask-role-mark project-role">
              <span />
              {t("团队组长 · 软件、嵌入式与系统整合", "Team leader · software, embedded systems & integration")}
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
                    {connectionPaths.map((path, index) => (
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
                    {connectionPaths.map((path, index) => {
                      const current = drawn && (active === 3 || pathStages[index] === active);
                      return <motion.path key={`stage-${index}`} d={path} className="mask-interface-pulse" initial={lowMotion ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: current ? 1 : 0, opacity: current ? 1 : 0 }} transition={slowMotion({ duration: lowMotion ? 0 : current ? .7 : .35, delay: lowMotion || !current ? 0 : (active === 3 ? index : index % 2) * .05, ease: [.22, 1, .36, 1] })}/>;
                    })}
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
                aria-label={`${stage.title} — ${expanded && active === index ? t("合上工作记录", "Close work record") : t("展开工作记录", "Open work record")}`}
                onClick={() => {
                  setActive(index);
                  setExpanded((current) => active === index ? !current : true);
                }}
              >
                <span className="mask-step-number">{stage.number}</span>
                <strong className="mask-step-title">{stage.title}</strong>
                <div className="mask-step-label">{stage.label}</div>
                <span className="mask-step-action" aria-hidden="true">{expanded && active === index ? <X size={16} /> : <Plus size={16} />}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mask-outcomes">
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
            {" "}<span>{t("实际交付", "DELIVERED WORK")}</span>
            <p>
              {t("可演示的系统原型", "Demonstrable system prototype")}
              <br />
              {t(
                "完成系统整合与测试，持续完善竞赛展示。",
                "Integrated, tested and refined for the competition demonstration.",
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
        </footer>
      </div>
    </section>
  );
}
