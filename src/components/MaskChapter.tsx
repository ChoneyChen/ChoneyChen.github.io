import { ReadingReveal } from "./ReadingReveal";
import { slowMotion } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
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
      "我参与将视觉分析转换为结构化控制参数，连接模型建议、软件界面、后端与本地控制。",
      "I helped turn visual analysis into structured control parameters, connecting model recommendations, the interface, backend and local control.",
    ),
    detail: t(
      "我的工作：软件开发、参数转换与接口整合。",
      "My work: software development, parameter conversion and interface integration.",
    ),
    label: t("分析 / 参数 / 接口", "ANALYSIS / PARAMETERS / INTERFACES"),
  },
  {
    number: "02",
    title: t("软件，接上硬件。", "Software meets hardware."),
    short: t("无线与嵌入式", "Wireless & embedded"),
    icon: Radio,
    text: t(
      "我参与 Raspberry Pi、ESP32-S3、LED 与加热模块的联调，让软件参数进入实际控制链路。",
      "I helped integrate Raspberry Pi, ESP32-S3, LED and heating modules, bringing software parameters into the physical control chain.",
    ),
    detail: t(
      "我的工作：跨模块调试与嵌入式整合。",
      "My work: debugging across modules and embedded system integration.",
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
      "我参与距离、温度与设备状态的传感联调，检查反馈、异常检测与停止条件。",
      "I helped test distance, temperature and device-status feedback, including fault detection and stopping conditions.",
    ),
    detail: t(
      "我的工作：传感器联调、阶段测试与系统验证。",
      "My work: sensor integration, staged testing and system verification.",
    ),
    label: t("距离 / 温度 / 状态", "DISTANCE / TEMPERATURE / STATUS"),
  },
  {
    number: "04",
    title: t("团队，共同交付原型。", "The team’s working prototype."),
    short: t("统筹与交付", "Coordination & delivery"),
    icon: Workflow,
    text: t(
      "作为组长，我统筹分工、进度、整合与交付，并参与原型建模和装配。课程后，团队继续完善原型并参加创客大赛。",
      "I led responsibilities, progress, integration and delivery, and contributed to prototype modelling and assembly. The team later refined the prototype for a maker competition.",
    ),
    detail: t(
      "我的工作：团队协调、原型整合与竞赛准备。",
      "My work: team coordination, prototype integration and competition preparation.",
    ),
    label: t("分工 / 联调 / 交付", "RESPONSIBILITIES / INTEGRATION / DELIVERY"),
  },
];

const makeConnections = (t: Translate) => [
  {
    number: "01",
    name: t("视觉分析", "Visual analysis"),
    note: t("AI 视觉分析", "AI visual analysis"),
    label: "VISUAL",
    stage: 0,
  },
  {
    number: "02",
    name: t("结构化参数", "Control parameters"),
    note: t("建议到控制参数", "From recommendations to control"),
    label: "PARAMETERS",
    stage: 0,
  },
  {
    number: "03",
    name: t("软件界面 / 本地后端", "Interface / local backend"),
    note: "Raspberry Pi · FastAPI",
    label: "LOCAL SOFTWARE",
    stage: 0,
  },
  {
    number: "04",
    name: "ESP32-S3",
    note: t("无线通信与设备控制", "Wireless device control"),
    label: "WIRELESS",
    stage: 1,
  },
  {
    number: "05",
    name: t("LED / 加热", "LED / heating"),
    note: t("光源与执行模块", "Light & actuator modules"),
    label: "ACTION",
    stage: 1,
  },
  {
    number: "06",
    name: t("传感反馈", "Sensor feedback"),
    note: t("距离 · 温度 · 状态", "Distance · temperature · status"),
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
              "工程原型 · MEC202 · 2026",
              "ENGINEERING PROTOTYPE · MEC202 · 2026",
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
                "我带领团队，把视觉分析、无线控制与传感反馈整合成可演示的原型。",
                "I led a team that connected visual analysis, wireless control and sensor feedback in a working prototype.",
              )}
            </p>
            <span className="mask-role-mark">
              <span />
              {t("团队组长 / 系统整合", "Team leader / system integration")}
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
                <span>2026.03 — 2026.07</span>
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
                        key={`interface-${active}`}
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
                      <span>{connection.note}</span>
                    </motion.button>
                  ))}
                  <span className="mask-feedback-label">
                    {t("反馈回到软件", "Feedback to software")}
                  </span>
                </motion.div>
                <p className="mask-diagram-note">
                  {t(
                    "系统链路示意 · 非实际硬件结构",
                    "System connection diagram · not the physical hardware layout",
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
                        "系统链路说明 · 选择环节，查看我参与的工作",
                        "Choose a stage to read about my contribution",
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
                  "从一个模块，到整个系统",
                  "From one module to a complete system",
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
              {t("团队工程原型交付", "Team engineering prototype delivered")}
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
            <span>{t("本人贡献", "MY CONTRIBUTION")}</span>
            <p>
              {t("统筹团队，", "Lead the team.")}
              <br />
              {t(
                "也亲自连接系统。",
                "Connect the system.",
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
