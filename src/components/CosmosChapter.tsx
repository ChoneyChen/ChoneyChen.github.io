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
import { X } from "lucide-react";
import { useContent } from "../data/use-content";
import { useI18n } from "../i18n";
import "./cosmos-chapter.css";

const getRecords = (t: (zh: string, en: string) => string) => [
  {
    label: t("数据调研", "Dataset review"),
    english: "DATA",
    title: t(
      "筛选有位姿真值的数据。",
      "Screen datasets for pose ground truth.",
    ),
    context: t(
      "调研自动驾驶与停车场数据集、开源模型及 CARLA 仿真资料，核查位姿真值、场景适配和训练条件。",
      "Reviewed driving and parking datasets, open-source models and CARLA resources. Checked pose ground truth, scene suitability and the conditions needed for training.",
    ),
    tags: [
      t("位姿真值", "Pose ground truth"),
      t("场景适配", "Scene suitability"),
      t("训练可行性", "Training feasibility"),
    ],
    color: "#cbb1ff",
  },
  {
    label: t("Qwen 训练", "Qwen training"),
    english: "QWEN",
    title: t(
      "训练 Qwen，迭代微调方案。",
      "Train Qwen and iterate on fine-tuning.",
    ),
    context: t(
      "重点负责 Qwen 训练环境、参数设定、过程监控与实验迭代，并参与模型选择和 LoRA 微调方案。",
      "My main work covered Qwen training setup, parameter settings, run monitoring and repeated experiments. I also contributed to model selection and LoRA fine-tuning plans.",
    ),
    tags: [
      t("Qwen 系列", "Qwen models"),
      "LoRA",
      t("过程监控", "Process monitoring"),
    ],
    color: "#dfff57",
  },
  {
    label: t("参数比较", "Tuning comparisons"),
    english: "TUNING",
    title: t(
      "比较数据覆盖与模型规模。",
      "Compare data coverage and model size.",
    ),
    context: t(
      "参与控制变量实验，比较训练数据规模、学习率、图像分辨率和模型规模对定位表现的影响。",
      "Contributed to controlled experiments on training-data size, learning rate, image resolution and model size, examining how each factor affected the model’s localisation performance.",
    ),
    tags: [
      t("数据规模", "Data scale"),
      t("图像分辨率", "Image resolution"),
      t("模型规模", "Model size"),
    ],
    color: "#83d9ed",
  },
  {
    label: t("计算评估", "Compute tradeoffs"),
    english: "COST",
    title: t(
      "同时评估精度与计算成本。",
      "Evaluate accuracy alongside compute cost.",
    ),
    context: t(
      "分析定位精度、显存占用、吞吐量与延迟，比较数据效率和模型扩大的计算代价。",
      "Analysed localisation accuracy, GPU memory, throughput and latency. Compared data efficiency with the compute costs of larger models rather than assessing accuracy in isolation.",
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

function PixelLocalisation({ ready, still, t }: { ready: boolean; still: boolean; t: (zh: string, en: string) => string }) {
  const visible = ready || still;
  return <figure className="cosmos-pose-preview">
    <svg viewBox="0 0 520 170" role="img" aria-label={t("定位原理示意：图像中的车位编号和柱子对应地图地标，约束车辆位置与朝向；非模型实时输出。", "Localisation illustration: parking identifiers and pillars correspond to map landmarks that constrain vehicle position and orientation. Not a live model output.")}>
      <g shapeRendering="crispEdges">
        <rect x="7" y="15" width="190" height="128" fill="#22183a" stroke="#a587cd"/>
        <path d="M8 54H196V142H8Z" fill="#34204f"/>
        <path d="M8 54L103 42L196 54M8 143L103 72L196 143M48 143L103 72L154 143" fill="none" stroke="#6e558d"/>
        <path d="M39 45H58V121H39ZM145 45H164V121H145Z" fill="#a587cd"/>
        <path d="M82 88H122V114H82ZM89 77H114V89H89Z" fill="#6c6091"/>
        <text x="71" y="34" fill="#dfff57" fontSize="13" fontFamily="monospace">P-01</text>
        <rect x="326" y="15" width="185" height="128" fill="#22183a" stroke="#a587cd"/>
        <path d="M356 16V142M387 16V142M419 16V142M450 16V142M481 16V142M327 46H510M327 78H510M327 110H510" fill="none" stroke="#6e558d"/>
        <path d="M345 31H365V63H345ZM473 31H493V63H473Z" fill="#5b4677" stroke="#a587cd"/>
      </g>
      <motion.path d="M213 79H302M287 70L302 79L287 88" fill="none" stroke="#dfff57" strokeWidth="2.5" initial={still ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 1 : 0 }} transition={slowMotion({ duration: still ? 0 : .5, delay: still ? 0 : visible ? .1 : 0, ease: pixelStep })}/>
      <motion.g initial={still ? false : { opacity: 0, y: 9 }} animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 9 }} transition={slowMotion({ duration: still ? 0 : .4, delay: still ? 0 : visible ? .2 : 0, ease: pixelStep })}>
        <path d="M355 48L418 104L483 48" fill="#dfff5709" stroke="#dfff57" strokeWidth="1.5" strokeDasharray="4 5"/>
        <path d="M348 42H361V55H348ZM476 42H489V55H476Z" fill="#dfff57"/>
        <path d="M407 99H426V112H407ZM412 90H421V99H412Z" fill="#83d9ed"/>
        <path d="M418 90V75M413 81L418 75L423 81" fill="none" stroke="#83d9ed" strokeWidth="2"/>
        <rect x="396" y="80" width="44" height="42" fill="none" stroke="#83d9ed" strokeDasharray="3 4"/>
      </motion.g>
      <text x="7" y="164" fill="#c8b8ea" fontSize="13" fontFamily="monospace">RGB / LANDMARKS</text><text x="326" y="164" fill="#c8b8ea" fontSize="13" fontFamily="monospace">MAP / VEHICLE POSE</text>
    </svg>
    <figcaption>{t("图像线索 → 地图位置", "Image clues → map position")}</figcaption>
  </figure>;
}

export function CosmosChapter({ quiet = false }: { quiet?: boolean }) {
  const { language, t } = useI18n();
  const { projects } = useContent();
  const records = getRecords(t);
  const project = projects.find((item) => item.id === "cosmos")!;
  const [selected, setSelected] = useState<number | null>(null);
  const [trails, setTrails] = useState<PixelTrail[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  useCollapseOnLeave("cosmos", () => { setSelected(null); setDragging(null); setTrails([]); });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const trailClock = useRef(0);
  const trailId = useRef(0);
  const headingRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const headingEntered = useInView(headingRef);
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
        <div ref={headingRef} className="cosmos-heading-presence"><motion.header className="cosmos-heading" initial={still ? false : { opacity: 0, y: 20 }} animate={{ opacity: headingReady ? 1 : 0, y: headingReady ? 0 : 20 }} transition={slowMotion({ duration: still ? 0 : headingReady ? .6 : .35, ease: [.22, 1, .36, 1] })}>
          <div>
            <p className="cosmos-project-number">
              {t("Cosmos-Loc · 视觉定位研究", "COSMOS-LOC · VISUAL LOCALISATION")}
            </p>
            <h2 id="cosmos-title" className="project-title">
              {t("基于视觉大模型的", "Vision-Language Vehicle Localisation")}
              {" "}<span>{t("地下停车场车辆定位", "in Underground Car Parks")}</span>
            </h2>
          </div>
          <div className="cosmos-introduction">
            <span className="cosmos-status">
              <i /> {t("已有团队实验结果", "Team experiments reported")}
            </span>
            <p className="project-summary">
              {t(
                "通过图像中的编号、标志与空间线索，研究地下停车场的车辆位置与朝向。",
                "Using numbers, signs and spatial clues in RGB images to investigate vehicle position and orientation underground.",
              )}
            </p>
            <p className="cosmos-my-role project-role">
              {" "}<span>{t("研究团队成员", "RESEARCH TEAM MEMBER")}</span>
              <strong>
                {t(
                  "Qwen 训练与实验分析",
                  "Qwen training and experiment analysis",
                )}
              </strong>
            </p>
          </div>
        </motion.header></div>

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
              {" "}<span>{t("CHONEY 的贡献记录", "CHONEY’S CONTRIBUTIONS")}</span>
              <span>
                {records.length} {t("条记录", "RECORDS")}
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
                    {record.english} / {t("本人工作", "MY WORK")}
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
                  <PixelLocalisation ready={deskReady} still={still} t={t}/>
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
              {t("向上抽取 · 点击 · ← → 选择", "Pull up · click · ← → to select")}
            </p>
          </motion.div>
        </div>

        <div className="cosmos-team-results" ref={resultsRef}>
          <div className="cosmos-results-label">
            <span className="cosmos-small-pixel" aria-hidden="true" />
            <p>
              {t("团队实验结果", "TEAM EXPERIMENT RESULTS")}
              <span>
                Cosmos-Reason2 + LoRA
                <br />
                {t("所报告的实验设置", "Reported experimental setting")}
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
      </div>
    </section>
  );
}
