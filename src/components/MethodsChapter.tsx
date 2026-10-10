import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { ReadingReveal } from "./ReadingReveal";
import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "../i18n";
import "./methods-chapter.css";

const getMethods = (t: (zh: string, en: string) => string) => [
  {
    id: "question",
    label: t("定义问题", "Define the question"),
    title: t("先写清楚，要回答什么。", "Write down the question first."),
    text: t(
      "把问题写成一句可检验的话：要解释、预测或改变什么？先确定输入、输出和适用条件，再决定需要收集哪些数据。",
      "Write a question that can be checked: what should be explained, predicted or changed? Define the inputs, outputs and conditions before deciding what data is needed.",
    ),
    detail: t(
      "推进时先核对变量与定义。如果问题发生变化，先更新问题说明，再调整模型或实现。",
      "Check the variables and definitions as the work develops. If the question changes, revise its framing before changing the model or implementation.",
    ),
    evidence: "LIF001",
    source: "#origins",
    color: "#285baf",
  },
  {
    id: "interfaces",
    label: t("接口与反馈", "Interfaces and feedback"),
    title: t("接通一条完整链路，再扩展。", "Connect one complete path, then expand."),
    text: t(
      "给每个模块写出输入、输出与异常状态。先沿一条最小链路检查参数能否传递、反馈能否返回，再逐步接入其余模块。",
      "Describe each module’s inputs, outputs and failure states. Check that parameters travel and feedback returns along one minimal path, then connect the remaining modules.",
    ),
    detail: t(
      "联调时把异常还原到具体接口，记录触发条件和改动，让每次修改都能再检查。",
      "Trace integration failures to a specific interface. Record what triggered the issue and what changed, so the fix can be checked again.",
    ),
    evidence: "MEC202",
    source: "#mask",
    color: "#ad5636",
  },
  {
    id: "experiments",
    label: t("实验与边界", "Experiments and boundaries"),
    title: t("保留条件和输出，再解释。", "Keep the conditions and output, then interpret."),
    text: t(
      "先固定数据划分与预处理规则，再改变要比较的条件。保留运行输出和失败记录，把实际观察与尚待验证的解释写开。",
      "Fix the data split and preprocessing rules before changing the condition being compared. Keep the actual output and failure records, and distinguish observations from explanations still to be tested.",
    ),
    detail: t(
      "单独检查训练与测试的边界。下一轮实验从记录里的差异出发，而不只追一个最好数字。",
      "Check the training and test boundaries separately. Let differences in the record guide the next experiment, rather than chasing only the best number.",
    ),
    evidence: "ISA305",
    source: "#archive",
    color: "#315946",
  },
  {
    id: "delivery",
    label: t("团队交付", "Team delivery"),
    title: t("把任务分清，把交接留好。", "Make responsibilities and handovers clear."),
    text: t(
      "先确认负责人、依赖关系和交付内容，再按阶段检查阻塞。整合时对齐版本、接口和待解决问题，让接手的人能继续推进。",
      "Agree on ownership, dependencies and deliverables, then check what is blocking progress at each stage. Align versions, interfaces and open issues so the next person can continue the work.",
    ),
    detail: t(
      "阶段交付留下当前状态、复现步骤和下一项任务；遇到变化，及时调整分工与计划。",
      "Leave the current state, reproduction steps and next task with each handover. Update responsibilities and plans when circumstances change.",
    ),
    evidence: "CAN201 / MEC202",
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
              <DrawPath {...draw} delay={0.28} d="M 24 146 Q 44 147 76 145" />
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

    </svg>
  );
}

export function MethodsChapter({ quiet = false }: { quiet?: boolean }) {
  const { language, t } = useI18n();
  const methods = getMethods(t);
  const [selected, setSelected] = useState(0);
  const [opened, setOpened] = useState(false);
  useCollapseOnLeave("methods", () => setOpened(false));
  const [pulse, setPulse] = useState(0);
  const reduce = useReducedMotion();
  const still = quiet || Boolean(reduce);
  const headerRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const headerEntered = useInView(headerRef, { once: false });
  const sceneEntered = useInView(sceneRef, { once: false, amount: 0.24 });
  const evidenceReady = still || opened;
  const current = methods[selected];
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
        <header className="methods-heading" ref={headerRef}>
          <div>
            <p className="chapter-kicker">
              {t("11 / 我的工作方法", "11 / MY WORKING METHODS")}
            </p>
            <h2 id="methods-title">
              {t("我的，", "My working")}
              <span>{t("工作方法。", "methods.")}</span>
            </h2>
            <svg
              className="methods-title-scribble"
              viewBox="0 0 230 20"
              aria-hidden="true"
            >
              <motion.path
                d="M 4 11 Q 78 4 221 8 M 10 16 Q 136 10 227 12"
                initial={still ? false : { pathLength: 0 }}
                animate={{ pathLength: still || headerEntered ? 1 : 0 }}
                transition={slowMotion({ duration: still ? 0 : 0.52 })}
              />
            </svg>
          </div>
          <p>
            {t(
              "先定义问题，再检查接口、实验与交付。",
              "Define the question, then check interfaces, experiments and delivery.",
            )}
            <br />
            {t("四种方法，都落在实际工作里。", "Four methods I bring to the work.")}
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
                animate={{ y: still || sceneEntered ? 0 : 9, rotate: still || sceneEntered ? 0 : index % 2 === 0 ? -.9 : .9 }}
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
                  <svg viewBox="0 0 230 60" preserveAspectRatio="none" aria-hidden="true">
                    <motion.path
                      d="M 4 8 Q 110 3 225 7 L 226 54 Q 113 57 5 52 Z M 7 5 Q 119 7 223 4 L 229 50"
                      initial={still ? false : { pathLength: 0 }}
                      animate={{ pathLength: still || sceneEntered ? 1 : 0 }}
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
          <div style={{ display: "flow-root" }}>
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
              <div className="reading-switch"><AnimatePresence initial={false}>
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
                      {t("关联实践", "RELATED PRACTICE")}
                    </p>
                    <a href={current.source}>
                      {current.evidence}<ArrowUpRight size={14} />
                    </a>
                  </div>
                  <div className="methods-evidence-copy">
                    <h4>{current.title}</h4>
                    <p>{current.text}</p>
                    <p className="methods-evidence-detail">{current.detail}</p>
                  </div>
                </motion.div>
              </AnimatePresence></div>
            </motion.div>
            </ReadingReveal>}</AnimatePresence>
          </div>

        </div>
        <a className="chapter-link methods-next" href="#next">
          {t("接下来：生活、学习与愿景", "Next: life, learning and aspirations")}
          <ArrowUpRight size={17} />
        </a>
      </div>
    </section>
  );
}
