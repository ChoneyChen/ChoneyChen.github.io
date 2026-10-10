import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useScenePresence as useInView } from "../hooks/useScenePresence";
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  AnimatePresence,
  motion,
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
      "筛选有位姿真值的数据。",
      "Screen datasets for pose ground truth.",
    ),
    context: t(
      "调研自动驾驶与停车场数据集、开源模型和 CARLA 仿真资料，检查位姿真值、地下场景适配及训练可行性。",
      "Reviewed driving and parking datasets, open-source models and CARLA simulation resources, checking pose ground truth, underground-scene suitability and training feasibility.",
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
      "训练 Qwen，迭代微调方案。",
      "Train Qwen and iterate on fine-tuning.",
    ),
    context: t(
      "重点负责 Qwen 系列的训练环境、参数设定、中间结果监控和实验迭代；参与模型选择与 LoRA 微调路线设计。",
      "My main work covered Qwen training environments, parameter settings, intermediate-result monitoring and experimental iteration. I also contributed to model selection and LoRA fine-tuning plans.",
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
      "比较数据覆盖与模型规模。",
      "Compare data coverage and model size.",
    ),
    context: t(
      "参与控制变量实验，比较训练数据规模、学习率、图像分辨率和模型规模对定位表现的影响。",
      "Contributed to controlled experiments comparing the effects of training-data size, learning rate, image resolution and model size on localisation.",
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
      "同时评估精度与计算成本。",
      "Evaluate accuracy alongside compute cost.",
    ),
    context: t(
      "分析定位精度、显存占用、推理吞吐量与延迟，比较数据效率和模型扩大的资源代价。",
      "Analysed localisation accuracy, GPU memory, inference throughput and latency, comparing data efficiency with the resource costs of larger models.",
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
            {t("03 / Cosmos-Loc · 视觉定位", "03 / COSMOS-LOC · VISUAL LOCALISATION")}
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
                "从单张 RGB 图像推断车辆位置与朝向，研究视觉语言模型如何利用地下停车场中的语义地标。",
                "Estimate a vehicle’s position and orientation from one RGB image, using semantic landmarks in GPS-denied underground car parks.",
              )}
            </p>
            <p className="cosmos-my-role">
              {t("研究团队成员 · 本人重点工作", "RESEARCH TEAM MEMBER · MY MAIN WORK")}
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
              <div className="reading-switch"><AnimatePresence initial={false}>
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
                  <p className="cosmos-reader-contribution">{record.context}</p>
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
                  <p className="cosmos-reader-label">{t("数据 / 训练 / 实验 / 评估", "DATA / TRAINING / EXPERIMENTS / EVALUATION")}</p>
                  <h3>{t("抽出工作记录。", "Pull a work record.")}</h3>
                </motion.div>}
              </AnimatePresence></div>
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
          <summary>{t("实验范围与关联记录", "Experiment scope & linked research")}</summary>
          <p>{t(
            "Gordon Owusu Boateng 研究团队的 Cosmos-Reason2 + LoRA 结果，仅对应所报告的实验设置；不能直接推断跨停车场泛化，开发评测与最终测试需区分。",
            "The Cosmos-Reason2 + LoRA results belong to Gordon Owusu Boateng’s research team and the reported experimental setting. They do not establish cross-facility generalisation; development evaluations and final tests must be distinguished.",
          )}</p>
          <p>{t(
            "2026.03—08 的地下停车场定位 SURF 记录与本项目技术内容重叠，在此合并说明，不另列独立成果。",
            "The 2026.03–08 SURF record on underground-car-park localisation overlaps with this research and is included here without claiming a separate set of results.",
          )}</p>
        </details>
        <footer className="cosmos-exits">
          <a className="chapter-link" href="#sups">
            {t(
              "下一项目：SUPS / SVL",
              "Next: SUPS / SVL",
            )}{" "}
            <ArrowDownRight size={16} />
          </a>
          <a className="chapter-link" href="#glimpse">
            {t(
              "相关毕业研究：U-IMPROVE",
              "Related final-year research: U-IMPROVE",
            )}{" "}
            <ArrowUpRight size={16} />
          </a>
        </footer>
      </div>
    </section>
  );
}
