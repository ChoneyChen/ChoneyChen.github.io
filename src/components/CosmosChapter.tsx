import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { ArrowDownRight, ArrowUpRight, X } from "lucide-react";
import { useContent } from "../data/use-content";
import { useI18n } from "../i18n";
import "./cosmos-chapter.css";

const getRecords = (t: (zh: string, en: string) => string) => [
  {
    label: t("调研", "Data"),
    english: "DATA",
    title: t(
      "先确认，数据能回答这个问题。",
      "First, check what the data can answer.",
    ),
    context: t(
      "我的研究从数据开始。地下停车场里的视觉线索，只有与位姿真值、场景条件和训练设置一起检查，才有可能成为可靠的实验材料。",
      "I started with the data: checking visual cues against pose ground truth, scene conditions and training requirements before treating them as experiment material.",
    ),
    tags: [
      t("位姿真值", "Pose ground truth"),
      t("场景适配", "Scene suitability"),
      t("训练可行性", "Training feasibility"),
    ],
    color: "#cbb1ff",
  },
  {
    label: t("训练", "Qwen"),
    english: "QWEN",
    title: t(
      "让训练跑起来，也让过程看得见。",
      "Run the training. Keep the process visible.",
    ),
    context: t(
      "Qwen 系列是我的主要工作。我参与环境、参数、过程监控与多轮迭代，把模型训练作为需要持续观察和比较的研究过程。",
      "My main contribution involved Qwen models: environment setup, parameters, monitoring and repeated experiments. Training was a process to observe and compare, rather than a single run.",
    ),
    tags: [
      t("Qwen 系列", "Qwen models"),
      "LoRA",
      t("过程监控", "Process monitoring"),
    ],
    color: "#dfff57",
  },
  {
    label: t("比较", "Tune"),
    english: "TUNING",
    title: t(
      "一个变量，值得单独追问。",
      "Give each variable its own question.",
    ),
    context: t(
      "不同的数据覆盖、学习率、图像分辨率和模型规模，会怎样影响定位？我参与多轮实验比较，把这些条件和模型表现一起分析。",
      "How do data coverage, learning rate, image resolution and model size affect localisation? I participated in repeated experiments to compare these conditions alongside model performance.",
    ),
    tags: [
      t("数据规模", "Data scale"),
      t("图像分辨率", "Image resolution"),
      t("模型规模", "Model size"),
    ],
    color: "#83d9ed",
  },
  {
    label: t("评估", "Review"),
    english: "COST",
    title: t(
      "精度之外，还有计算的代价。",
      "Accuracy comes with a computational cost.",
    ),
    context: t(
      "一个实验结果要同时回答：有多准确，需要多少显存，处理得有多快。我参与分析精度、吞吐量和延迟，让性能与资源代价一起被看见。",
      "An experiment should show accuracy, memory requirements and processing speed together. I helped analyse accuracy, throughput and latency alongside the resources they required.",
    ),
    tags: [
      t("精度 / 显存", "Accuracy / memory"),
      t("吞吐量", "Throughput"),
      t("延迟", "Latency"),
    ],
    color: "#ff8eab",
  },
];

interface PixelTrail {
  id: number;
  x: number;
  y: number;
  color: string;
}
const pixelStep = (progress: number) => Math.ceil(progress * 8) / 8;

export function CosmosChapter({ quiet = false }: { quiet?: boolean }) {
  const { language, t } = useI18n();
  const { projects } = useContent();
  const records = getRecords(t);
  const project = projects.find((item) => item.id === "cosmos")!;
  const [selected, setSelected] = useState<number | null>(null);
  useCollapseOnLeave("cosmos", () => setSelected(null));
  const [trails, setTrails] = useState<PixelTrail[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const trailClock = useRef(0);
  const trailId = useRef(0);
  const headingRef = useRef<HTMLElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headingEntered = useInView(headingRef, { once: false, amount: "some" });
  const deskEntered = useInView(deskRef, { once: false, amount: "some" });
  const resultsEntered = useInView(resultsRef, { once: false, amount: "some" });
  const reduce = useReducedMotion();
  const still = quiet || Boolean(reduce);
  const headingReady = still || headingEntered;
  const deskReady = still || deskEntered;
  const resultsReady = still || resultsEntered;
  const record = selected === null ? null : records[selected];

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? records.length - 1
          : ((selected ?? (event.key === "ArrowRight" ? -1 : 0)) +
              (event.key === "ArrowRight" ? 1 : -1) +
              records.length) %
            records.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  function addTrail(x: number, y: number, color: string) {
    if (still || performance.now() - trailClock.current < 45) return;
    trailClock.current = performance.now();
    const particle = { id: ++trailId.current, x, y, color };
    setTrails((items) => [...items.slice(-10), particle]);
  }

  return (
    <section
      id="cosmos"
      className={`chapter cosmos-chapter ${language === "en" ? "is-english" : ""}`}
      aria-labelledby="cosmos-title"
    >
      <div className="chapter-inner cosmos-inner">
        <div className="cosmos-masthead">
          <p className="chapter-kicker">
            {t("04 / 我的空间研究", "04 / MY WORK IN SPATIAL RESEARCH")}
          </p>
          <p className="cosmos-date">2025.12 — 2026.09</p>
        </div>
        <header className="cosmos-heading" ref={headingRef}>
          <div>
            <p className="cosmos-project-number">
              {t("视觉定位研究", "VISUAL LOCALISATION RESEARCH")}
            </p>
            <motion.h2
              id="cosmos-title"
              initial={still ? false : { clipPath: "inset(0 100% 0 0)" }}
              animate={{
                clipPath: headingReady
                  ? "inset(0 0% 0 0)"
                  : "inset(0 100% 0 0)",
              }}
              transition={slowMotion({ duration: still ? 0 : 0.56, ease: pixelStep })}
            >
              COSMOS<span>— LOC</span>
            </motion.h2>
          </div>
          <div className="cosmos-introduction">
            <span className="cosmos-status">
              <i /> {t("已有团队实验结果", "Team experiments reported")}
            </span>
            <h3>
              {t("在看起来一样的地方，", "When places look alike,")}
              <br />
              {t("我在哪里？", "where am I?")}
            </h3>
            <p>
              {t(
                "用视觉语言模型，在 GPS 拒止的地下停车场中推断位置。",
                "Visual language models for localisation in GPS-denied underground parking facilities.",
              )}
            </p>
            <p className="cosmos-my-role">
              {t("我在团队里：", "My contribution: ")}
              <strong>
                {t(
                  "Qwen 训练与实验分析",
                  "Qwen training and experiment analysis",
                )}
              </strong>
            </p>
          </div>
        </header>

        <div
          className="cosmos-record-stage"
          ref={deskRef}
          data-entry-state={deskReady ? "present" : "reset"}
          style={{ display: "flow-root" }}
        >
          <motion.div
            className="cosmos-record-desk"
            data-entry-style="pixel-scan"
            initial={still ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{
              clipPath: deskReady ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
            }}
            transition={slowMotion({
              duration: still ? 0 : deskReady ? 0.52 : 0.4,
              delay: still || deskReady ? 0 : 0.12,
              ease: pixelStep,
            })}
          >
            <div className="cosmos-record-topline">
              <span>{t("CHONEY 的贡献记录", "CHONEY’S CONTRIBUTIONS")}</span>
              <span>
                {t("4 条记录", "4 RECORDS")}
              </span>
            </div>
            <div
              className="cosmos-reader"
              role={record ? "tabpanel" : undefined}
              id="cosmos-record-panel"
              aria-labelledby={record ? `cosmos-record-${selected}` : undefined}
              data-open={Boolean(record)}
            >
              <div className="cosmos-reader-index" aria-hidden="true">
                <span>{selected === null ? "—" : `0${selected + 1}`}</span>
                <div className="cosmos-index-pixels">
                  {Array.from({ length: 12 }, (_, i) => (
                    <i
                      key={i}
                      style={{
                        opacity: selected !== null && i % 4 <= selected ? 1 : 0.18,
                        background: record?.color ?? "#dfff57",
                      }}
                    />
                  ))}
                </div>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {record && selected !== null ? <motion.div
                  key={selected}
                  className="cosmos-reader-copy"
                  initial={still ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={slowMotion({ duration: still ? 0 : 0.3 })}
                >
                  <button
                    className="cosmos-record-close"
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label={t("放回研究记录", "Put the record back")}
                  >
                    <X size={17} />
                  </button>
                  <p
                    className="cosmos-reader-label"
                    style={{ color: record.color }}
                  >
                    {t("我具体做了什么", "WHAT I WORKED ON")} / {record.label}
                  </p>
                  <h3>{record.title}</h3>
                  <p className="cosmos-reader-contribution">
                    {project.contributions[selected]}
                  </p>
                  <details className="cosmos-record-context">
                    <summary>{t("实验背景", "Experiment context")}</summary>
                    <p className="cosmos-reader-context">{record.context}</p>
                  </details>
                  <div className="cosmos-record-tags">
                    {record.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </motion.div> : <motion.div
                  key="closed"
                  className="cosmos-reader-empty"
                  initial={still ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={slowMotion({ duration: still ? 0 : 0.25 })}
                >
                  <p className="cosmos-reader-label">{t("等待一份研究记录", "READY FOR A RESEARCH RECORD")}</p>
                  <h3>{t("抽出一块，看看我做了什么。", "Pull a cartridge. Explore my contribution.")}</h3>
                </motion.div>}
              </AnimatePresence>
            </div>
            <div
              className="cosmos-cartridge-rack"
              role="tablist"
              aria-label={t(
                "查看 Cosmos-Loc 本人贡献",
                "Read my Cosmos-Loc contributions",
              )}
              onKeyDown={navigate}
            >
              {records.map((item, index) => (
                <motion.div
                  className={`cosmos-cartridge-slot ${selected === index ? "is-selected" : ""}`}
                  key={item.english}
                  initial={
                    still ? false : { y: 23, clipPath: "inset(85% 0 0 0)" }
                  }
                  animate={{
                    y: deskReady ? 0 : 23,
                    clipPath: deskReady
                      ? "inset(-70px -40px -40px -40px)"
                      : "inset(85% 0 0 0)",
                  }}
                  transition={slowMotion({
                    duration: still ? 0 : deskReady ? 0.32 : 0.24,
                    delay: still ? 0 : deskReady ? 0.28 + index * 0.06 : (records.length - 1 - index) * 0.03,
                    ease: pixelStep,
                  })}
                >
                  <span className="cosmos-slot-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <motion.button
                    className="cosmos-cartridge"
                    style={{ "--cartridge-color": item.color } as CSSProperties}
                    role="tab"
                    id={`cosmos-record-${index}`}
                    aria-controls="cosmos-record-panel"
                    aria-selected={selected === index}
                    aria-expanded={selected === index}
                    aria-label={`${item.label}：${item.title}`}
                    tabIndex={selected === index || (selected === null && index === 0) ? 0 : -1}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    onClick={() => setSelected((current) => current === index ? null : index)}
                    drag
                    dragSnapToOrigin dragTransition={slowDragRelease}
                    dragElastic={0.25}
                    dragConstraints={{
                      left: -28,
                      right: 28,
                      top: -62,
                      bottom: 12,
                    }}
                    onDragStart={() => {
                      setSelected(index);
                      setDragging(index);
                    }}
                    onDrag={(_, info) =>
                      addTrail(
                        info.offset.x + index * 14,
                        info.offset.y,
                        item.color,
                      )
                    }
                    onDragEnd={() => {
                      setDragging(null);
                      setTrails([]);
                    }}
                    whileDrag={still ? {} : { scale: 1.03, rotate: -2 }}
                    animate={{
                      y: selected === index && dragging !== index ? -9 : 0,
                    }}
                    transition={
                      slowMotion(still
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 32 })
                    }
                  >
                    <span
                      className="cosmos-cartridge-ridges"
                      aria-hidden="true"
                    >
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="cosmos-cartridge-label">
                      <b>{item.english}</b>
                      <strong>{item.label}</strong>
                      <span>CHONEY / WORK 0{index + 1}</span>
                    </span>
                    <span
                      className="cosmos-cartridge-connector"
                      aria-hidden="true"
                    >
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </motion.button>
                  {dragging === index &&
                    trails.map((pixel) => (
                      <motion.i
                        key={pixel.id}
                        className="cosmos-pixel-trail"
                        aria-hidden="true"
                        style={{
                          background: pixel.color,
                          left: "50%",
                          top: "48%",
                        }}
                        initial={{
                          x: pixel.x - index * 14,
                          y: pixel.y,
                          opacity: 0.6,
                          scale: 0.8,
                        }}
                        animate={{ y: pixel.y + 24, opacity: 0, scale: 0.2 }}
                        transition={slowMotion({ duration: 0.36 })}
                        onAnimationComplete={() =>
                          setTrails((items) =>
                            items.filter((item) => item.id !== pixel.id),
                          )
                        }
                      />
                    ))}
                </motion.div>
              ))}
            </div>
            <p className="cosmos-operation">
              <span aria-hidden="true">↖</span>{" "}
              {t(
                "向上抽取 / 点击",
                "Pull up / click",
              )}
              <span className="cosmos-keyboard-hint">
                {t(
                  "← → 切换 · 再点放回",
                  "← → to switch · Click again to close",
                )}
              </span>
            </p>
          </motion.div>
        </div>

        <div className="cosmos-team-results" ref={resultsRef}>
          <div className="cosmos-results-label">
            <span className="cosmos-small-pixel" aria-hidden="true" />
            <p>
              {t("团队的实验结果", "Team experiment results")}
              <span>
                Cosmos-Reason2 + LoRA
                <br />
                {t("特定实验设置", "Under a specific experiment setup")}
              </span>
            </p>
          </div>
          {project.results.map((result, index) => (
            <motion.div
              className="cosmos-result"
              key={result.value}
              initial={still ? false : { clipPath: "inset(0 0 100% 0)" }}
              animate={{
                clipPath: resultsReady
                  ? "inset(0 0 0% 0)"
                  : "inset(0 0 100% 0)",
              }}
              transition={slowMotion({
                duration: still ? 0 : resultsReady ? 0.32 : 0.28,
                delay: still ? 0 : resultsReady ? index * 0.07 : (project.results.length - 1 - index) * 0.03,
                ease: pixelStep,
              })}
            >
              <strong>{result.value}</strong>
              <span>{result.label}</span>
            </motion.div>
          ))}
        </div>
        <details className="cosmos-boundary">
          <summary>{t("实验范围与团队归属", "Experiment scope & team attribution")}</summary>
          <p>{t(
            "以上为 Cosmos-Reason2 + LoRA 在特定设置下的团队指标；我的主要贡献是 Qwen 训练与多轮实验分析。结果不直接说明跨停车场泛化，开发评测与最终测试需区分。",
            "These Cosmos-Reason2 + LoRA metrics are team results under a specific setup. My main contribution was Qwen training and repeated experiment analysis. They do not establish cross-facility generalisation; development evaluations and final tests must be distinguished.",
          )}</p>
        </details>
        <footer className="cosmos-exits">
          <a className="chapter-link" href="#sups">
            {t(
              "为研究建立可控制的空间",
              "Build a controllable research environment",
            )}{" "}
            <ArrowDownRight size={16} />
          </a>
          <a className="chapter-link" href="#glimpse">
            {t(
              "我的毕业研究，继续追问感知",
              "Continue the question in my final-year research",
            )}{" "}
            <ArrowUpRight size={16} />
          </a>
        </footer>
      </div>
    </section>
  );
}
