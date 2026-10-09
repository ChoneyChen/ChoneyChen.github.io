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
      "先把视觉，变成参数。",
      "First, turn visual analysis into parameters.",
    ),
    short: t("视觉与软件", "Vision & software"),
    icon: ScanLine,
    text: t(
      "我参与视觉分析到结构化控制参数的转换，把模型建议接到界面、后端与本地控制。系统不仅要能给出建议，还要能清楚地传递它。",
      "I helped convert visual analysis into structured control parameters, connecting model recommendations to the interface, backend and local control. A recommendation also needs a clear route through the system.",
    ),
    detail: t(
      "我的工作：软件开发、参数转换与接口整合。",
      "My work: software development, parameter conversion and interface integration.",
    ),
    label: t("分析 / 参数 / 接口", "ANALYSIS / PARAMETERS / INTERFACES"),
  },
  {
    number: "02",
    title: t("再让软件，接上硬件。", "Then, connect software to hardware."),
    short: t("无线与嵌入式", "Wireless & embedded"),
    icon: Radio,
    text: t(
      "我参与 Raspberry Pi、ESP32-S3 与 LED、加热模块的联调，让软件参数进入实际的控制链路。不同模块的接口，是需要一起解决的工程问题。",
      "I helped test and integrate Raspberry Pi, ESP32-S3, LED and heating modules, bringing software parameters into the physical control chain. The interfaces between modules required shared engineering work.",
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
      "让反馈，也成为系统的一部分。",
      "Make feedback part of the system.",
    ),
    short: t("控制与反馈", "Control & feedback"),
    icon: Thermometer,
    text: t(
      "距离、温度和设备状态不能留在系统之外。我参与传感器与控制模块的测试和联调，关注反馈如何回来、异常怎样被发现，以及系统何时应当停止。",
      "Distance, temperature and device status belong in the control loop. I helped test sensors and control modules, checking how feedback returns, how faults are detected and when the system should stop.",
    ),
    detail: t(
      "我的工作：传感器联调、阶段测试与系统验证。",
      "My work: sensor integration, staged testing and system verification.",
    ),
    label: t("距离 / 温度 / 状态", "DISTANCE / TEMPERATURE / STATUS"),
  },
  {
    number: "04",
    title: t("最后，把团队的工作拼在一起。", "Bring the team’s work together."),
    short: t("统筹与交付", "Coordination & delivery"),
    icon: Workflow,
    text: t(
      "作为团队组长，我统筹分工、进度、系统整合与交付，也参与原型建模和装配。课程结束后，我们继续完善原型，把它带到创客大赛。",
      "As team leader, I coordinated responsibilities, progress, system integration and delivery, and contributed to prototype modelling and assembly. After the course, we continued refining the prototype for a maker competition.",
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
  const entered = useInView(storyRef, { once: true, amount: 0.12 });
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start 70%", "end 65%"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [7, -7]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
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
          <p className="chapter-kicker">05 / BUILDING A SYSTEM</p>
          <p className="mask-eyebrow">
            {t(
              "智能光疗面罩 · MEC202 · 2026",
              "Intelligent phototherapy mask · MEC202 · 2026",
            )}
          </p>
          <h2 id="mask-title">
            {t("我把它们，", "I brought it all")}
            <br />
            <span>{t("做成一个系统。", "into one system.")}</span>
          </h2>
          <div className="mask-introduction">
            <p>
              {t(
                "从视觉分析到无线控制，从一段代码到可以演示的原型。",
                "From visual analysis to wireless control; from code to a working prototype. ",
              )}
              <br className="mask-desktop-break" />
              {t(
                "我在这个团队里，既是组长，也是参与软件与嵌入式联调的人。",
                "I led the team and contributed to software and embedded system integration.",
              )}
            </p>
            <span className="mask-role-mark">
              <span />
              {t("团队组长 / 系统整合", "Team leader / system integration")}
            </span>
          </div>
        </header>

        <div className="mask-story-layout" ref={storyRef}>
          <div className="mask-product-column">
            <div
              className={`mask-product-stage${expanded ? " is-expanded" : ""}`}
            >
              <div className="mask-stage-topline">
                <span>SYSTEM CONNECTIONS</span>
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
                        <path d="M0 0L6 3L0 6" fill="#c2b5a6" />
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
                        transition={{
                          duration: lowMotion ? 0 : 0.8,
                          delay: lowMotion ? 0 : index * 0.07,
                          ease: "easeInOut",
                        }}
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
                        transition={{
                          duration: 1.05,
                          delay: 0.12,
                          ease: "easeInOut",
                          times: [0, 0.25, 0.8, 1],
                        }}
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
                      transition={{
                        duration: lowMotion ? 0 : 0.65,
                        delay: lowMotion ? 0 : index * 0.085,
                        ease: [0.22, 1, 0.36, 1],
                      }}
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
                  <motion.div
                    id="mask-system-chain"
                    className="mask-system-chain"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: lowMotion ? 0 : 0.35 }}
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
                  </motion.div>
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
              <article
                className={`mask-story-step${active === index ? " is-current" : ""}`}
                key={stage.number}
              >
                <span className="mask-step-number">{stage.number}</span>
                <h3>{stage.title}</h3>
                <p>{stage.text}</p>
                <div className="mask-step-label">{stage.label}</div>
              </article>
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
            <span>
              {t("我从这次经历里带走的", "WHAT I TOOK FROM THIS EXPERIENCE")}
            </span>
            <p>
              {t("做好一个模块，", "Build a good module,")}
              <br />
              {t(
                "还要让它与其他模块一起工作。",
                "then make it work with the others.",
              )}
            </p>
            <small>
              {t(
                "这是团队工程原型，展示系统集成与控制思路；不作临床疗效或医疗认证声明。",
                "A team engineering prototype demonstrating system integration and control ideas, without claims of clinical efficacy or medical certification.",
              )}
            </small>
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
