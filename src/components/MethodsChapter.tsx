import { ReadingReveal } from "./ReadingReveal";
import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useContent } from "../data/use-content";
import { useI18n } from "../i18n";
import "./methods-chapter.css";

const getMethods = (t: (zh: string, en: string) => string) => [
  {
    id: "lif001",
    label: t("把问题具体化", "Frame it"),
    word: "QUESTION",
    title: t(
      "用数据，解释一个日常问题。",
      "Use data to explain an everyday question.",
    ),
    evidence: t(
      "校园食堂客流预测 / LIF001",
      "Campus canteen footfall / LIF001",
    ),
    period: "2023.10 — 2024.05",
    text: t(
      "我参与选题、数据处理与建模：用 Python 清洗数据，把天气和日期编码成特征，再建立多元线性回归。R²、F 检验和残差检查，是研究条件与模型结果的一部分。",
      "I participated in topic selection, data preparation and modelling: cleaning data with Python, encoding weather and date features, and building a multiple linear regression. R², F-tests and residual checks were part of examining the model.",
    ),
    detail: t(
      "工作内容有记录；没有可靠原始结果的预测误差或 R²，不补写成数字。",
      "The work is documented. Prediction errors and R² values are only reported when reliable original results are available.",
    ),
    source: "#origins",
    color: "#285baf",
  },
  {
    id: "mec202",
    label: t("把链路搭起来", "Connect"),
    word: "CONNECT",
    title: t(
      "不同模块，要能一起工作。",
      "Make the different modules work together.",
    ),
    evidence: t(
      "智能光疗面罩 / MEC202",
      "Phototherapy mask prototype / MEC202",
    ),
    period: "2026.03 — 2026.07",
    text: t(
      "作为团队组长，我统筹任务、进度和系统整合，也参与软件、嵌入式、传感器与原型结构的联调。视觉分析后的参数，要能进入控制；反馈，也要能回到系统。",
      "As team leader, I coordinated tasks, schedules and integration, and helped test software, embedded modules, sensors and prototype structure together. Parameters from visual analysis had to reach the controls, and feedback had to return to the system.",
    ),
    detail: t(
      "这是我参与推进的团队工程原型。课程成绩 79；团队获得苏州选拔赛优秀奖。",
      "This is a team engineering prototype I helped develop. The course mark was 79; the team received an Excellence Award at the Suzhou selection event.",
    ),
    source: "#mask",
    color: "#ad5636",
  },
  {
    id: "isa305",
    label: t("看真实的输出", "Check output"),
    word: "CHECK",
    title: t(
      "先保留输出，再解释结果。",
      "Keep the output. Then explain the result.",
    ),
    evidence: t(
      "人工智能与 MATLAB 实验 / ISA305",
      "AI and MATLAB experiments / ISA305",
    ),
    period: t("2026.09 — 至今", "2026.09 — PRESENT"),
    text: t(
      "在感知机、EEG 运动想象分类与 CSP 实验中，我保留真实运行输出。Week 4 使用 100 个训练试次和 44 个测试试次；学习率 0.01 时，测试准确率为 77.27%。",
      "I retain the actual output from perceptron, EEG motor-imagery classification and CSP experiments. Week 4 used 100 training trials and 44 test trials. At a learning rate of 0.01, test accuracy was 77.27%.",
    ),
    detail: t(
      "CSP 与标准化只在训练集拟合，训练和测试边界保持分开。这是特定课程实验，不能推广为临床诊断表现。",
      "CSP and standardisation were fitted on the training set only, keeping training and test boundaries separate. These are results from a specific course experiment, with no clinical diagnostic claim.",
    ),
    source: "#archive",
    color: "#315946",
  },
  {
    id: "can201",
    label: t("和团队一起交付", "Together"),
    word: "TOGETHER",
    title: t(
      "把一份任务，做成团队的交付。",
      "Turn a shared task into a team delivery.",
    ),
    evidence: "Computer Networking Project / CAN201",
    period: t("2025 · 具体学期待核对", "2025 · term to be confirmed"),
    text: t(
      "我担任 CAN201 小组组长，参与完成团队交付，Coursework 成绩为 82.5。这门由 Gordon 授课的课程，也成为后续科研合作的起点。",
      "I led the CAN201 group and participated in the team delivery, earning a coursework mark of 82.5. This course, taught by Gordon, also became the starting point for our later research collaboration.",
    ),
    detail: t(
      "保留已确认的角色与课程结果；项目题目和具体技术内容，等待原报告补齐。",
      "The role and course result are confirmed. The original report is still needed to establish the project title and technical details.",
    ),
    source: "#archive",
    color: "#754e96",
  },
];
const stations = [110, 310, 510, 710];
const rightArms = [
  "M 0 29 Q 15 35 27 26 Q 35 18 39 24",
  "M 0 29 Q 14 34 27 38 Q 34 36 41 31",
  "M 0 29 Q 14 38 26 31 Q 34 25 43 26",
  "M 0 29 Q 17 27 30 34 Q 36 37 43 34",
];
const leftArms = [
  "M 0 29 Q -11 36 -14 49 Q -10 53 -6 54",
  "M 0 29 Q -12 34 -16 46 Q -10 51 -4 48",
  "M 0 29 Q -12 34 -15 46 Q -10 49 -5 49",
  "M 0 29 Q -13 34 -17 46 Q -12 48 -6 49",
];

function DrawPath({
  d,
  className,
  ready,
  still,
  delay = 0,
}: {
  d: string;
  className?: string;
  ready: boolean;
  still: boolean;
  delay?: number;
}) {
  return (
    <motion.path
      className={className}
      d={d}
      initial={still ? false : { pathLength: 0 }}
      animate={{ pathLength: ready ? 1 : 0 }}
      transition={slowMotion({ duration: still ? 0 : 0.43, delay: still ? 0 : delay })}
    />
  );
}

function HandFigure({
  teammate = false,
  ready,
  still,
}: {
  teammate?: boolean;
  ready: boolean;
  still: boolean;
}) {
  const draw = { ready, still };
  return (
    <g className="methods-hand-lines">
      <DrawPath
        {...draw}
        delay={0.12}
        d="M -10 5 Q -13 -8 0 -10 Q 14 -7 12 5 Q 11 18 -1 18 Q -12 17 -10 5"
      />
      <DrawPath {...draw} delay={0.2} d="M 0 18 Q -3 40 0 64" />
      <DrawPath
        {...draw}
        delay={0.32}
        d="M 0 64 Q -11 78 -18 90 M 0 64 Q 11 78 20 89"
      />
      <DrawPath
        {...draw}
        delay={0.27}
        d={
          teammate
            ? "M 0 29 Q -18 28 -28 35 Q -36 34 -42 34 M 0 29 Q 15 36 20 48"
            : "M 0 29 Q -14 35 -17 48 M 0 29 Q 14 35 22 49"
        }
      />
      <DrawPath {...draw} delay={0.26} d="M -4 3 L -3 3 M 6 3 L 7 3" />
      <DrawPath {...draw} delay={0.3} d="M -2 10 Q 2 12 6 9" />
    </g>
  );
}

function MethodScene({
  selected,
  pulse,
  still,
  entered,
  compact = false,
}: {
  selected: number;
  pulse: number;
  still: boolean;
  entered: boolean;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const methods = getMethods(t);
  const suffix = compact ? "mobile" : "desktop";
  const ready = still || entered;
  const draw = { ready, still };
  return (
    <svg
      className={`methods-scene ${compact ? "methods-scene-mobile" : "methods-scene-desktop"}`}
      viewBox={
        compact ? `${stations[selected] - 100} 70 228 183` : "0 0 840 275"
      }
      role="img"
      aria-labelledby={`methods-scene-title-${suffix}`}
    >
      <title id={`methods-scene-title-${suffix}`}>
        {t("手绘步骤示意：", "Drawn reading guide: ")}
        {methods[selected].label}
      </title>
      <DrawPath
        {...draw}
        className="methods-ground"
        d="M 27 235 Q 208 232 424 235 Q 617 239 820 234 M 33 239 Q 345 237 481 239 Q 658 236 813 239"
      />
      {stations.map((position, index) => (
        <g
          key={position}
          transform={`translate(${position} 0)`}
          className="methods-station-props"
          opacity={ready ? (selected === index ? 1 : 0.2) : 0}
        >
          {index === 0 ? (
            <>
              <DrawPath
                {...draw}
                delay={0.06}
                className="methods-drawn-paper"
                d="M 20 116 L 81 113 L 86 211 L 17 213 Z"
              />
              <DrawPath
                {...draw}
                delay={0.17}
                d="M 29 131 Q 48 129 69 131 M 29 139 L 67 137"
              />
              <text x="30" y="155">
                DATA
              </text>
              <DrawPath
                {...draw}
                delay={0.26}
                d="M 31 192 L 31 175 M 42 192 L 42 165 M 53 192 L 53 180 M 64 192 L 64 169"
              />
              <DrawPath {...draw} delay={0.31} d="M 28 197 Q 51 198 70 196" />
            </>
          ) : index === 1 ? (
            <>
              <DrawPath
                {...draw}
                delay={0.1}
                className="methods-drawn-paper"
                d="M 16 175 L 48 173 L 49 215 L 14 217 Z M 77 175 L 110 174 L 110 217 L 75 217 Z"
              />
              <text x="20" y="199">
                AI
              </text>
              <text x="81" y="199">
                IO
              </text>
              <motion.path
                key={`wire-${pulse}`}
                d="M 48 190 Q 61 167 77 190 M 76 210 Q 60 233 48 210"
                initial={still ? false : { pathLength: 0 }}
                animate={{ pathLength: ready ? 1 : 0 }}
                transition={slowMotion({
                  duration: still ? 0 : 0.7,
                  delay: still ? 0 : 0.1,
                })}
              />
              <DrawPath
                {...draw}
                delay={0.29}
                d="M 56 177 L 62 173 L 60 180 M 66 222 L 59 225 L 62 218"
              />
            </>
          ) : index === 2 ? (
            <>
              <DrawPath
                {...draw}
                delay={0.16}
                className="methods-drawn-paper"
                d="M 17 118 L 84 120 L 82 215 L 18 212 Z"
              />
              <text x="25" y="138">
                TRAIN
              </text>
              <DrawPath {...draw} delay={0.28} d="M 24 146 Q 44 147 76 145" />
              <text x="25" y="166">
                TEST
              </text>
              <DrawPath
                {...draw}
                delay={0.33}
                d="M 23 173 Q 42 175 73 173 M 25 185 Q 44 183 66 186"
              />
              <motion.path
                key={`check-${pulse}`}
                className="methods-check-mark"
                d="M 46 196 L 52 202 L 67 190"
                initial={still ? false : { pathLength: 0 }}
                animate={{ pathLength: ready ? 1 : 0 }}
                transition={slowMotion({
                  duration: still ? 0 : 0.65,
                  delay: still ? 0 : 0.18,
                })}
              />
            </>
          ) : (
            <>
              <DrawPath
                {...draw}
                delay={0.22}
                className="methods-handoff"
                d="M 8 191 L 31 188 L 34 207 L 9 209 Z"
              />
              <g transform="translate(45 143)">
                <HandFigure {...draw} teammate />
              </g>
              <motion.path
                key={`together-${pulse}`}
                className="methods-success-rays"
                d="M 8 120 L 8 109 M 20 123 L 26 114 M -4 122 L -10 113"
                initial={still ? false : { pathLength: 0 }}
                animate={{ pathLength: ready ? 1 : 0 }}
                transition={slowMotion({
                  duration: still ? 0 : 0.25,
                  delay: still ? 0 : 0.32,
                })}
              />
            </>
          )}
        </g>
      ))}
      <motion.g
        initial={false}
        animate={{ x: stations[selected] - 40 }}
        transition={slowMotion({ duration: still ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] })}
      >
        <g transform="translate(0 143)">
          <motion.g
            key={pulse}
            className="methods-hand-lines methods-actor"
            animate={
              still || !ready
                ? { y: 0, rotate: 0 }
                : {
                    y: [0, -4, 0],
                    rotate: selected === 2 ? [0, -4, 0] : [0, 2, 0],
                  }
            }
            transition={slowMotion({ duration: still ? 0 : 0.75 })}
          >
            <DrawPath
              {...draw}
              delay={0.12}
              d="M -10 5 Q -13 -8 0 -10 Q 14 -7 12 5 Q 11 18 -1 18 Q -12 17 -10 5"
            />
            <DrawPath
              {...draw}
              delay={0.18}
              className="methods-secondary-line"
              d="M -10 4 Q -11 -8 1 -9 Q 14 -5 11 7"
            />
            <DrawPath {...draw} delay={0.22} d="M 0 18 Q -3 40 0 64" />
            <motion.path
              d={leftArms[selected]}
              initial={still ? false : { pathLength: 0 }}
              animate={{ d: leftArms[selected], pathLength: ready ? 1 : 0 }}
              transition={slowMotion({
                duration: still ? 0 : 0.43,
                delay: still ? 0 : 0.27,
              })}
            />
            <motion.path
              d={rightArms[selected]}
              initial={still ? false : { pathLength: 0 }}
              animate={{ d: rightArms[selected], pathLength: ready ? 1 : 0 }}
              transition={slowMotion({
                duration: still ? 0 : 0.43,
                delay: still ? 0 : 0.32,
              })}
            />
            <motion.path
              d="M 0 64 Q -11 78 -18 90"
              initial={still ? false : { pathLength: 0 }}
              animate={{
                pathLength: ready ? 1 : 0,
                d:
                  still || !ready
                    ? "M 0 64 Q -11 78 -18 90"
                    : [
                        "M 0 64 Q -11 78 -18 90",
                        "M 0 64 Q -4 76 -11 91",
                        "M 0 64 Q -11 78 -18 90",
                      ],
              }}
              transition={slowMotion({
                duration: still ? 0 : 0.65,
                delay: still ? 0 : 0.2,
              })}
            />
            <DrawPath {...draw} delay={0.37} d="M 0 64 Q 11 78 20 89" />
            <DrawPath
              {...draw}
              delay={0.3}
              d="M -4 3 L -3 3 M 6 3 L 7 3 M -2 10 Q 2 12 6 9"
            />
            {selected === 0 && (
              <g className="methods-magnifier">
                <motion.circle
                  cx="39"
                  cy="16"
                  r="9"
                  initial={still ? false : { pathLength: 0 }}
                  animate={{ pathLength: ready ? 1 : 0 }}
                  transition={slowMotion({
                    duration: still ? 0 : 0.42,
                    delay: still ? 0 : 0.3,
                  })}
                />
                <DrawPath {...draw} delay={0.4} d="M 33 23 L 27 31" />
              </g>
            )}
          </motion.g>
        </g>
      </motion.g>
      {!compact && (
        <g className="methods-scene-labels">
          {methods.map((method, index) => (
            <text
              key={method.word}
              x={stations[index]}
              y="46"
              textAnchor="middle"
            >
              0{index + 1} / {method.word}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
}

export function MethodsChapter({ quiet = false }: { quiet?: boolean }) {
  const { language, t } = useI18n();
  const { experienceTimeline } = useContent();
  const methods = getMethods(t);
  const [selected, setSelected] = useState(0);
  const [opened, setOpened] = useState(false);
  useCollapseOnLeave("methods", () => setOpened(false));
  const [pulse, setPulse] = useState(0);
  const reduce = useReducedMotion();
  const still = quiet || Boolean(reduce);
  const sceneRef = useRef<HTMLDivElement>(null);
  const evidenceRef = useRef<HTMLDivElement>(null);
  const sceneEntered = useInView(sceneRef, { once: false, amount: 0.24 });
  const evidenceEntered = useInView(evidenceRef, { once: false, amount: 0.12 });
  const evidenceReady = still || evidenceEntered;
  const current = methods[selected];
  const experience = experienceTimeline.find((item) => item.id === current.id);
  function choose(index: number) {
    setOpened(index === selected ? !opened : true);
    setSelected(index);
    setPulse((count) => count + 1);
  }

  return (
    <section
      id="methods"
      className={`chapter methods-chapter ${language === "en" ? "is-english" : ""}`}
      aria-labelledby="methods-title"
    >
      <div className="chapter-inner methods-inner">
        <header className="methods-heading">
          <div>
            <p className="chapter-kicker">
              {t("02 / 我怎样推进一个想法", "02 / HOW I MOVE AN IDEA FORWARD")}
            </p>
            <h2 id="methods-title">
              {t("我怎样，", "How I")}
              <span>{t("做一件事。", "move an idea.")}</span>
            </h2>
            <svg
              className="methods-title-scribble"
              viewBox="0 0 230 20"
              aria-hidden="true"
            >
              <motion.path
                d="M 4 11 Q 78 4 221 8 M 10 16 Q 136 10 227 12"
                initial={still ? false : { pathLength: 0 }}
                animate={still ? { pathLength: 1 } : undefined}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={slowMotion({ duration: still ? 0 : 0.52 })}
              />
            </svg>
          </div>
          <p>
            {t(
              "从课程研究到团队原型。",
              "From class research to team prototypes. ",
            )}
            <br />
            {t("四个步骤，对应我的实际工作。", "Four steps, grounded in my work.")}
          </p>
        </header>
        <div className="methods-notebook" data-still={still}>
          <div className="methods-paper-top">
            <span>{t("CHONEY 的工作笔记", "CHONEY’S WORKING NOTES")}</span>
            <span>{t("点击或轻拽步骤标签", "Click or pull a step label")}</span>
          </div>
          <div
            className="methods-illustration"
            ref={sceneRef}
            data-drawn={still || sceneEntered}
          >
            <MethodScene
              selected={selected}
              pulse={pulse}
              still={still}
              entered={sceneEntered}
            />
            <MethodScene
              selected={selected}
              pulse={pulse}
              still={still}
              entered={sceneEntered}
              compact
            />
          </div>
          <div
            className="methods-steps"
            aria-label={t(
              "查看陈天一的工作步骤与证据",
              "Read Choney Chen’s working steps and evidence",
            )}
          >
            {methods.map((method, index) => (
              <motion.div
                key={method.id}
                className="methods-step-writing"
                initial={
                  still ? false : { y: 9, rotate: index % 2 === 0 ? -0.9 : 0.9 }
                }
                animate={still ? { y: 0, rotate: 0 } : undefined}
                whileInView={{ y: 0, rotate: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={slowMotion({
                  duration: still ? 0 : 0.42,
                  delay: still ? 0 : index * 0.055,
                })}
              >
                <motion.button
                  className={opened && selected === index ? "is-selected" : ""}
                  type="button"
                  aria-pressed={opened && selected === index}
                  aria-expanded={opened && selected === index}
                  aria-controls="methods-evidence"
                  onClick={() => choose(index)}
                  drag="x"
                  dragSnapToOrigin dragTransition={slowDragRelease}
                  dragConstraints={{ left: -15, right: 15 }}
                  onDragStart={() => { setSelected(index); setOpened(true); setPulse(count => count + 1); }}
                  whileDrag={
                    still ? {} : { rotate: index % 2 === 0 ? -3 : 3, y: -3 }
                  }
                  transition={
                    slowMotion(still
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 32 })
                  }
                >
                  <span>0{index + 1}</span>
                  <strong>{method.label}</strong>
                  <svg viewBox="0 0 230 60" aria-hidden="true">
                    <motion.path
                      d="M 4 8 Q 110 3 225 7 L 226 54 Q 113 57 5 52 Z M 7 5 Q 119 7 223 4 L 229 50"
                      initial={still ? false : { pathLength: 0 }}
                      animate={still ? { pathLength: 1 } : undefined}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: false, amount: 0.25 }}
                      transition={slowMotion({
                        duration: still ? 0 : 0.52,
                        delay: still ? 0 : index * 0.055,
                      })}
                    />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </div>
          <div ref={evidenceRef} style={{ display: "flow-root" }}>
            <AnimatePresence initial={false}>{opened && <ReadingReveal className="methods-reading" initial={{ gridTemplateRows: "0fr", opacity: 0 }} animate={{ gridTemplateRows: "1fr", opacity: 1 }} exit={{ gridTemplateRows: "0fr", opacity: 0 }} transition={slowMotion({ duration: still ? 0 : 0.3 })}>
            <motion.div
              className="methods-evidence"
              id="methods-evidence"
              aria-live="polite"
              initial={still ? false : { clipPath: "inset(0 100% 0 0)" }}
              animate={{
                clipPath: evidenceReady
                  ? "inset(0 0% 0 0)"
                  : "inset(0 100% 0 0)",
              }}
              transition={slowMotion({
                duration: still ? 0 : 0.46,
                ease: [0.22, 1, 0.36, 1],
              })}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selected}
                  className="methods-evidence-grid"
                  initial={still ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={slowMotion({ duration: still ? 0 : 0.16 })}
                >
                  <div className="methods-evidence-source">
                    <p style={{ color: current.color }}>
                      {t("来自我的一段真实记录", "EVIDENCE FROM MY WORK")}
                    </p>
                    <h3>{current.evidence}</h3>
                    <span>{current.period}</span>
                    <span className="methods-evidence-role">
                      {experience?.role}
                    </span>
                    <a href={current.source}>
                      {t("阅读相关经历", "Read the related experience")}{" "}
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                  <div className="methods-evidence-copy">
                    <h4>{current.title}</h4>
                    <p>{current.text}</p>
                    <p className="methods-evidence-detail">{current.detail}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
            </ReadingReveal>}</AnimatePresence>
          </div>
          <footer className="methods-paper-foot">
            <span>
              {t(
                "观察 · 连接 · 检验 · 协作",
                "Observe · Connect · Check · Collaborate",
              )}
            </span>
            <span>
              {t("工作笔记 / 2026", "WORKING NOTES / 2026")}
            </span>
          </footer>
        </div>
        <a className="chapter-link methods-next" href="#directions">
          {t("接下来：我关注的三个研究方向", "Next: my three research directions")}
          <ArrowUpRight size={17} />
        </a>
      </div>
    </section>
  );
}
