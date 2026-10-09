import { ReadingReveal } from "./ReadingReveal";
import { slowMotion } from "../lib/motionTiming";
import { GlimpsePerception } from "./GlimpsePerception";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  MoveHorizontal,
  Minus,
  Plus,
} from "lucide-react";
import { useI18n } from "../i18n";
import "./future-chapter.css";

interface FutureChapterProps {
  quiet?: boolean;
}

type GenerationRoute = "diffusion" | "autoregressive";
type CollaborationFocus = "data" | "constraints" | "iteration";

const getRouteCopy = (t: (zh: string, en: string) => string) =>
  ({
    diffusion: {
      title: t("扩散式图像生成", "Diffusion image generation"),
      description: t(
        "以 RGB 图像和自然语言指令为条件，从噪声逐步恢复任务图像，再确定性解码出分割、度量深度或表面法线。多个任务共享同一个感知骨干。",
        "Conditioned on RGB images and natural-language instructions, diffusion progressively recovers a task image from noise. Deterministic decoding recovers segmentation, metric depth or surface normals from a shared perception backbone.",
      ),
      next: t("拟比较单任务、联合任务及联合后专项微调，检查生成与解码误差。", "Planned comparisons cover single-task, joint-task and joint-then-specialised tuning, including generation and decoding errors."),
      label: t("扩散式生成", "Diffusion generation"),
      layer: t("条件去噪与 RGB 输出", "Conditioned denoising to RGB"),
      decoder: t("任务图像的确定性解码", "Deterministic task decoding"),
    },
    autoregressive: {
      title: t("自回归式图像生成", "Autoregressive image generation"),
      description: t(
        "框架也纳入自回归式图像生成：图像与文字编码为 token，经 Transformer 生成视觉 token，再解码为 RGB 任务图像。最终仍通过任务解码器恢复感知结果。",
        "The framework also considers autoregressive image generation: a Transformer processes image and text tokens, generates visual tokens, and an RGB decoder produces the task image. A task decoder then recovers perception outputs.",
      ),
      next: t("这是拟研究的生成骨干方案，具体模型选择与训练结果仍待验证。", "This is a proposed backbone option. Model selection and training results remain to be validated."),
      label: t("自回归式生成", "Autoregressive generation"),
      layer: t("视觉 token 到 RGB 输出", "Visual tokens to RGB output"),
      decoder: t("任务图像的确定性解码", "Deterministic task decoding"),
    },
  }) as const;

const getCollaborationCopy = (t: (zh: string, en: string) => string) =>
  ({
    data: {
      number: "01",
      title: t(
        "先确认位置与姿态真值。",
        "Start with position and pose ground truth.",
      ),
      description: t(
        "筛选停车与驾驶数据集，检查车辆位置或姿态真值，为定位方案的验证准备数据。",
        "I help screen parking and driving datasets for vehicle position or pose ground truth, preparing reliable references for localisation evaluation.",
      ),
      keywords: [
        t("数据集调研", "Dataset screening"),
        t("位置 / 姿态真值", "Position / pose ground truth"),
        t("验证条件", "Validation conditions"),
      ],
    },
    constraints: {
      number: "02",
      title: t(
        "把观察变成空间约束。",
        "Turn observations into constraints.",
      ),
      description: t(
        "在方案讨论中研究语义地标、距离、方位与地图拓扑的对应关系，并保留共享观察中的冲突供一致性检查。",
        "In framework discussions, I explore semantic landmarks, distances, bearings and map topology, retaining conflicting shared observations for consistency checks.",
      ),
      keywords: [
        t("环境语义地标", "Semantic landmarks"),
        t("地图拓扑", "Map topology"),
        t("一致性检查", "Consistency checks"),
      ],
    },
    iteration: {
      number: "03",
      title: t(
        "从失败样例，走向下一轮。",
        "Let failures guide the next test.",
      ),
      description: t(
        "参与仿真与闭环框架讨论，用复杂、长尾场景检查方案，再由失败样例推动新一轮数据与验证。",
        "I contribute to simulation exploration and closed-loop framework discussions, using difficult and long-tail scenarios to guide new data and validation.",
      ),
      keywords: [
        t("复杂场景", "Difficult scenes"),
        t("失败样例", "Failure cases"),
        t("再验证", "Re-evaluation"),
      ],
    },
  }) as const;

function bounded(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function FutureChapter({ quiet = false }: FutureChapterProps) {
  const { t } = useI18n();
  const systemQuiet = useReducedMotion();
  const reduced = quiet || Boolean(systemQuiet);
  const [route, setRoute] = useState<GenerationRoute>("diffusion");
  const [expression, setExpression] = useState(0);
  const [alignment, setAlignment] = useState(50);
  const [researchOpen, setResearchOpen] = useState(false);
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  useCollapseOnLeave("glimpse", () => { setResearchOpen(false); setExpression(0); });
  useCollapseOnLeave("avpc", () => { setCollaborationOpen(false); setAlignment(50); });
  const expressionStart = useRef(0);
  const alignmentStart = useRef(50);
  const glassRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const glassInView = useInView(glassRef, { once: false, amount: 0.25 });
  const printInView = useInView(printRef, { once: false, amount: 0.25 });
  const glassReady = reduced || glassInView;
  const printReady = reduced || printInView;
  const representation3D = expression >= 50;
  const focus: CollaborationFocus =
    alignment < 30 ? "data" : alignment > 70 ? "iteration" : "constraints";
  const currentRoute = getRouteCopy(t)[route];
  const currentCollaboration = getCollaborationCopy(t)[focus];
  const reveal = reduced
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  function moveExpression(_: unknown, info: PanInfo) {
    setExpression(bounded(expressionStart.current + info.offset.x * 0.38));
    if (Math.abs(info.offset.x) > 12) setResearchOpen(true);
  }

  function moveAlignment(_: unknown, info: PanInfo) {
    setAlignment(bounded(alignmentStart.current + info.offset.x * 0.42));
    if (Math.abs(info.offset.x) > 12) setCollaborationOpen(true);
  }

  const glassStyle = { "--research-open": expression / 100 } as CSSProperties;
  const printStyle = { "--view-shift": (alignment - 50) / 50 } as CSSProperties;

  return (
    <>
      <section
        id="glimpse"
        className={`chapter future-glimpse${reduced ? " is-quiet" : ""}`}
        aria-labelledby="glimpse-title"
      >
        <div className="chapter-inner">
          <div className="fg-heading-row">
            <p className="chapter-kicker">
              {t("08 / 我的毕业研究", "08 / MY FINAL-YEAR RESEARCH")}
            </p>
            <span className="fg-status">
              <span />
              {t(" FYP · 研究进行中", " FYP · research in progress")}
            </span>
          </div>
          <motion.div
            className="fg-introduction"
            initial={reduced ? false : { x: -20, opacity: 0 }}
            animate={reduced ? { x: 0, opacity: 1 } : undefined}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={
              slowMotion(reduced
                ? { duration: 0 }
                : { duration: 0.58, ease: [0.22, 1, 0.36, 1] })
            }
          >
            <div>
              <p className="fg-project-name">{t("地下停车场 · 生成式开放词汇空间感知", "UNDERGROUND PARKING · GENERATIVE SPATIAL PERCEPTION")}</p>
              <h2 id="glimpse-title">U-IMPROVE</h2>
              <p className="fg-project-question">{t("让图像生成模型，读懂地下停车场。", "Image generators for understanding underground parking.")}</p>
            </div>
            <div className="fg-personal">
              <p className="fg-role">
                {t("本人毕业研究 · PSP305", "MY FINAL-YEAR PROJECT · PSP305")}
              </p>
              <p>
                {t(
                  "研究仅凭 RGB 与语言指令，生成可解码的语义与度量几何，再构建可查询的 3D 场景。",
                  "Investigating decodable semantics and metric geometry from RGB and language, towards queryable 3D scenes.",
                )}
              </p>
            </div>
          </motion.div>

          <GlimpsePerception quiet={reduced} />
          <div className="fg-route-row">
            <div className="fg-axis-caption">
              <span>A</span>
              <div>
                <small>{t("如何生成", "How to generate")}</small>
                <p>{t("两条生成路线", "Two generation routes")}</p>
              </div>
            </div>
            <div
              className="fg-route-switch"
              role="group"
              aria-label={t(
                "选择 U-IMPROVE 生成路线",
                "Choose a U-IMPROVE generation route",
              )}
            >
              <button
                type="button"
                aria-pressed={route === "diffusion"}
                className={route === "diffusion" ? "is-selected" : ""}
                onClick={() => { setRoute("diffusion"); setResearchOpen(true); }}
              >
                <span>01</span>
                {t(" 扩散式生成", " Diffusion generation")}
              </button>
              <button
                type="button"
                aria-pressed={route === "autoregressive"}
                className={route === "autoregressive" ? "is-selected" : ""}
                onClick={() => { setRoute("autoregressive"); setResearchOpen(true); }}
              >
                <span>02</span> {t(" 自回归式生成", " Autoregressive generation")}
              </button>
            </div>
          </div>

          <div className="fg-blueprint">
            <details className="fg-material-column fg-architecture-notes"><summary>{t("展开研究蓝图与表达轴", "Open the research blueprint & representation axis")}</summary>
              <motion.div
                ref={glassRef}
                className={`fg-glass-stage ${representation3D ? "is-expanded" : ""}`}
                style={glassStyle}
                onPanStart={() => {
                  expressionStart.current = expression;
                }}
                onPan={moveExpression}
                aria-label={t(
                  "拖动研究蓝图可切换表达层；下方也可使用按钮与滑块",
                  "Drag the blueprint to change the representation layer, or use the buttons and slider below",
                )}
              >
                <motion.div
                  className="fg-stage-grid"
                  aria-hidden="true"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: glassReady ? 1 : 0 }}
                  transition={slowMotion(reduced ? { duration: 0 } : { duration: 0.7 })}
                />
                <motion.div
                  className="fg-stage-label"
                  initial={reduced ? false : { x: -12, opacity: 0 }}
                  animate={{
                    x: glassReady ? 0 : -12,
                    opacity: glassReady ? 1 : 0,
                  }}
                  transition={slowMotion(reduced ? { duration: 0 } : { duration: 0.45 })}
                >
                  <span>RESEARCH BLUEPRINT</span>
                  <span>{representation3D ? "2D → 3D" : "PIXEL-ALIGNED"}</span>
                </motion.div>
                <motion.div
                  className="fg-layer-arrival fg-layer-arrival-input"
                  initial={
                    reduced
                      ? false
                      : { x: -24, y: 28, scale: 0.98, opacity: 0 }
                  }
                  animate={{
                    x: glassReady ? 0 : -24,
                    y: glassReady ? 0 : 28,
                    scale: glassReady ? 1 : 0.98,
                    opacity: glassReady ? 1 : 0,
                  }}
                  transition={
                    slowMotion(reduced
                      ? { duration: 0 }
                      : { duration: 0.58, delay: 0, ease: [0.22, 1, 0.36, 1] })
                  }
                >
                  <motion.div
                    className="fg-glass-layer fg-layer-input"
                    animate={{
                      y: -expression * 0.15,
                      rotate: -5 - expression * 0.015,
                    }}
                    transition={slowMotion(reveal)}
                  >
                    <span className="fg-layer-index">INPUT / 01</span>
                    <strong>
                      {t("图像 + 文字任务", "Image + text instruction")}
                    </strong>
                    <p>RGB image × instruction</p>
                    <div className="fg-input-outline" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="fg-layer-arrival fg-layer-arrival-generation"
                  initial={
                    reduced
                      ? false
                      : { x: 20, y: 25, scale: 0.98, opacity: 0 }
                  }
                  animate={{
                    x: glassReady ? 0 : 20,
                    y: glassReady ? 0 : 25,
                    scale: glassReady ? 1 : 0.98,
                    opacity: glassReady ? 1 : 0,
                  }}
                  transition={
                    slowMotion(reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.58,
                          delay: 0.15,
                          ease: [0.22, 1, 0.36, 1],
                        })
                  }
                >
                  <motion.div
                    className="fg-glass-layer fg-layer-generation"
                    animate={{
                      y: -expression * 0.06,
                      rotate: expression * 0.025,
                    }}
                    transition={slowMotion(reveal)}
                  >
                    <span className="fg-layer-index">GENERATION / 02</span>
                    <strong>{currentRoute.layer}</strong>
                    <p>
                      {t("预训练图像生成模型", "Pretrained image generator")}
                    </p>
                    <div className="fg-token-grid" aria-hidden="true">
                      {Array.from({ length: 15 }, (_, i) => (
                        <i key={i} />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="fg-layer-arrival fg-layer-arrival-decoding"
                  initial={
                    reduced
                      ? false
                      : { x: -16, y: 26, scale: 0.98, opacity: 0 }
                  }
                  animate={{
                    x: glassReady ? 0 : -16,
                    y: glassReady ? 0 : 26,
                    scale: glassReady ? 1 : 0.98,
                    opacity: glassReady ? 1 : 0,
                  }}
                  transition={
                    slowMotion(reduced
                      ? { duration: 0 }
                      : { duration: 0.58, delay: 0.3, ease: [0.22, 1, 0.36, 1] })
                  }
                >
                  <motion.div
                    className="fg-glass-layer fg-layer-decoding"
                    animate={{
                      y: expression * 0.05,
                      rotate: 5 + expression * 0.02,
                    }}
                    transition={slowMotion(reveal)}
                  >
                    <span className="fg-layer-index">DECODING / 03</span>
                    <strong>{currentRoute.decoder}</strong>
                    <p>
                      {route === "diffusion"
                        ? t(
                            "从视觉编码恢复感知结果",
                            "Recover perception from visual codes",
                          )
                        : t(
                            "从 RGB 任务图像恢复感知结果",
                            "Recover perception from RGB task images",
                          )}
                    </p>
                    <span className="fg-layer-rule" aria-hidden="true" />
                  </motion.div>
                </motion.div>
                <motion.div
                  className="fg-layer-arrival fg-layer-arrival-expression"
                  initial={
                    reduced
                      ? false
                      : { x: 18, y: 24, scale: 0.98, opacity: 0 }
                  }
                  animate={{
                    x: glassReady ? 0 : 18,
                    y: glassReady ? 0 : 24,
                    scale: glassReady ? 1 : 0.98,
                    opacity: glassReady ? 1 : 0,
                  }}
                  transition={
                    slowMotion(reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.58,
                          delay: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        })
                  }
                >
                  <motion.div
                    className="fg-glass-layer fg-layer-expression"
                    animate={{
                      y: expression * 0.18,
                      rotate: 2 + expression * 0.015,
                    }}
                    transition={slowMotion(reveal)}
                  >
                    <span className="fg-layer-index">REPRESENTATION / 04</span>
                    <strong>
                      {representation3D
                        ? t(
                            "拟探索：语义与几何融合",
                            "Proposed: semantic geometry",
                          )
                        : t("2D：语义与度量几何", "2D: semantics and metric geometry")}
                    </strong>
                    <p>
                      {representation3D
                        ? t(
                            "点云 / BEV / 体素 / 占据表达",
                            "Point cloud / BEV / voxels / occupancy",
                          )
                        : t(
                            "像素遮罩 / 度量深度 / 表面法线",
                            "Pixel masks / metric depth / surface normals",
                          )}
                    </p>
                    <span className="fg-expression-symbol" aria-hidden="true">
                      {representation3D ? "◇" : "□"}
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>

              <div className="fg-expression-control">
                <div className="fg-expression-label">
                  <div className="fg-axis-caption">
                    <span>B</span>
                    <div>
                      <small>{t("如何表达", "How to represent")}</small>
                      <p>{t("展开表达层", "Explore the representation")}</p>
                    </div>
                  </div>
                  <MoveHorizontal size={20} aria-hidden="true" />
                </div>
                <label className="fg-range-label" htmlFor="glimpse-expression">
                  {t(
                    "左右拖动，探索 2D 与拟研究的 3D 表达",
                    "Drag to explore 2D and proposed 3D representations",
                  )}
                </label>
                <input
                  id="glimpse-expression"
                  className="fg-range"
                  type="range"
                  min="0"
                  max="100"
                  value={expression}
                  aria-valuetext={
                    representation3D
                      ? t(
                          "3D 空间表达，研究方向尚待验证",
                          "3D spatial representation: a research direction requiring validation",
                        )
                      : t(
                          "2D 分割与深度，基础任务设计",
                          "2D segmentation and depth: the foundational task design",
                        )
                  }
                  onChange={(event) => { setExpression(Number(event.target.value)); setResearchOpen(true); }}
                />
                <div className="fg-range-endpoints">
                  <button
                    type="button"
                    aria-pressed={!representation3D}
                    onClick={() => { setExpression(0); setResearchOpen(true); }}
                  >
                    {t("2D 任务图像", "2D task images")}
                  </button>
                  <button
                    type="button"
                    aria-pressed={representation3D}
                    onClick={() => { setExpression(100); setResearchOpen(true); }}
                  >
                    {t("3D 表达 · 拟研究", "3D representation · proposed")}
                  </button>
                </div>
              </div>
            </details>

            <motion.div
              className="fg-research-reading"
              aria-live="polite"
              initial={reduced ? false : { x: 18, opacity: 0 }}
              animate={reduced ? { x: 0, opacity: 1 } : undefined}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={
                slowMotion(reduced
                  ? { duration: 0 }
                  : { duration: 0.6, ease: [0.22, 1, 0.36, 1] })
              }
            >
              <p className="fg-reading-number">{t("研究框架", "RESEARCH FRAMEWORK")}</p>
              <div className="fg-reading-summary">
                <h3>{t("两条生成路线。", "Two generation routes.")}<br/>{t("语义与几何融合。", "Semantic-geometric fusion.")}</h3>
                <p>{t("Presence-Aware Metadata Strip 让输出携带目标状态；任务解码器恢复语义与几何，相机内参用于度量 3D 抬升。", "A Presence-Aware Metadata Strip carries target status. Task decoders recover semantics and geometry; camera intrinsics support metric 3D lifting.")}</p>
              </div>
              <button type="button" className="future-reading-toggle" aria-expanded={researchOpen} aria-controls="glimpse-research-details" onClick={() => setResearchOpen(!researchOpen)}>{researchOpen ? t("收起研究笔记", "Close research notes") : t("阅读研究笔记", "Read research notes")}{researchOpen ? <Minus size={16}/> : <Plus size={16}/>}</button>
              <AnimatePresence mode="wait" initial={false}>
                {researchOpen && <ReadingReveal
                  id="glimpse-research-details"
                  className="future-details"
                  key={`${route}-${representation3D}`}
                  initial={reduced ? false : { opacity: 0, gridTemplateRows: "0fr" }}
                  animate={{ opacity: 1, gridTemplateRows: "1fr" }}
                  exit={{ opacity: reduced ? 1 : 0, gridTemplateRows: "0fr" }}
                  transition={slowMotion(reveal)}
                >
                  <h3>{currentRoute.title}</h3>
                  <p>{currentRoute.description}</p>
                  <div className="fg-representation-reading">
                    <span>
                      {t("表达方向 /", "Representation /")}{" "}
                      {representation3D ? "B2" : "B1"}
                    </span>
                    <h4>
                      {representation3D
                        ? t(
                            "由语义与深度，走向空间。",
                            "From semantics and depth to space.",
                          )
                        : t(
                            "先在像素上，说明白答案。",
                            "First, make the pixel-level answer explicit.",
                          )}
                    </h4>
                    <p>
                      {representation3D
                        ? t(
                            "利用度量深度与相机内参 K 恢复相机坐标系中的 3D 点，再附加查询条件下的语义。语义点云是拟研究的表达，BEV、体素、占据及 3D Gaussians 为后续扩展；多帧方案仍待确定。",
                            "Metric depth and camera intrinsics K recover 3D points in the camera frame, with query-conditioned semantics attached. Semantic point clouds are a proposed representation; BEV, voxels, occupancy and 3D Gaussians are extensions. Multi-frame choices remain open.",
                          )
                        : t(
                            "不同指令使用共享模型生成 RGB 编码的分割、度量深度或表面法线。分割输出通过 Metadata Strip 表达存在、不存在或不确定，再确定性解码目标遮罩；正式检测课题以查询条件分割作为通向边界框的路线。",
                            "Different instructions use a shared model to generate RGB-encoded segmentation, metric depth or surface normals. The segmentation Metadata Strip expresses present, absent or uncertain before deterministic mask decoding. Query-conditioned segmentation provides a route to boxes for the formal detection topic.",
                          )}
                    </p>
                  </div>
                  <p className="fg-pending">{currentRoute.next}</p>
                  <p className="fg-pending">{t("拟评估：通用 / 道路 / 地下停车场，分别测试类别与环境泛化、固定与自然指令，以及正负查询。未见类别指感知微调时未见。", "Planned evaluation: general, road and underground-parking scenes; category and environment transfer; fixed and natural queries; positive and negative queries. Unseen categories are held out from perception fine-tuning.")}</p>
                  <p className="fg-supervisor">{t("Gordon Owusu Boateng 指导 · 2026.08/09 — 至今", "Supervised by Gordon Owusu Boateng · Aug/Sep 2026 — present")}</p>
                </ReadingReveal>}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="fg-evaluation" aria-label={t("拟采用的评估指标", "Planned evaluation metrics")}>
            <p>{t("评估方案 · 尚无最终实验指标", "EVALUATION PLAN · FINAL RESULTS PENDING")}</p>
            <div><span><strong>FPR ↓</strong><small>{t("不存在目标的误报", "False positives on absent targets")}</small></span><span><strong>IoU ↑</strong><small>{t("分割遮罩的空间重叠", "Segmentation mask overlap")}</small></span><span><strong>AbsRel ↓</strong><small>{t("度量深度的相对误差", "Relative metric-depth error")}</small></span></div>
          </div>
          <details className="fg-source-framework">
            <summary>{t("查看我的完整研究框架", "View my full research framework")}</summary>
            <figure><img src="/research/u-improve-framework.png" loading="lazy" alt={t("U-IMPROVE 拟研究框架：RGB 与查询、扩散或自回归图像生成、任务解码、相机标定与语义 3D 点，后续可扩展为其他 3D 表达。", "Proposed U-IMPROVE framework: RGB and query inputs, diffusion or autoregressive image generation, task decoding, camera calibration and semantic 3D points, with further representation extensions.")}/><figcaption>{t("来自 Tianyi.pptx 的研究框架图；为方法设计，尚待训练与实验验证。", "Research framework from Tianyi.pptx. A method design requiring training and experimental validation.")}</figcaption></figure>
            <p className="fg-formal-title">{t("正式毕业课题：", "Formal dissertation topic: ")}Image-Generation-Based Open-Vocabulary Object Detection for Driving Environment Perception in Underground Parking Lots</p>
          </details>

          <a className="chapter-link fg-next-link" href="#avpc">
            {t(
              "沿着空间研究，继续到协同方向 ",
              "Follow the spatial research into collaboration ",
            )}
            <ArrowDownRight size={19} />
          </a>
        </div>
      </section>

      <section
        id="avpc"
        className={`chapter future-avpc${reduced ? " is-quiet" : ""}`}
        aria-labelledby="avpc-title"
      >
        <div className="chapter-inner">
          <div className="fa-heading-row">
            <p className="chapter-kicker">
              {t("09 / 团队里的持续研究", "09 / ONGOING TEAM RESEARCH")}
            </p>
            <span>{t("2026 — 至今", "2026 — present")}</span>
          </div>
          <motion.div
            className="fa-introduction"
            initial={reduced ? false : { x: 22, opacity: 0 }}
            animate={reduced ? { x: 0, opacity: 1 } : undefined}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={
              slowMotion(reduced
                ? { duration: 0 }
                : { duration: 0.58, ease: [0.22, 1, 0.36, 1] })
            }
          >
            <div><p className="fa-project-name">{t("协同感知与空间约束", "COLLABORATIVE PERCEPTION")}</p><h2 id="avpc-title">AVPC</h2><p className="fa-project-question">{t("多辆车的局部观察，怎样形成共同的空间约束？", "How can vehicles reconcile partial observations?")}</p></div>
            <div>
              <p className="fa-role">
                {t(
                  "团队研究参与者 · 进行中",
                  "RESEARCH PARTICIPANT · IN PROGRESS",
                )}
              </p>
              <p className="fa-intro-copy">
                {t(
                  "参与数据筛选、感知与定位方案讨论，以及仿真探索。",
                  "Dataset screening, perception and localisation discussions, and simulation exploration.",
                )}
              </p>
            </div>
          </motion.div>

          <motion.div
            ref={printRef}
            className="fa-overprint"
            style={printStyle}
            onPanStart={() => {
              alignmentStart.current = alignment;
            }}
            onPan={moveAlignment}
            aria-label={t(
              "左右拖动研究页，阅读数据、共同约束和迭代工作；也可以使用下方按钮",
              "Drag the research sheets to read about data, shared constraints and iteration, or use the buttons below",
            )}
          >
            <motion.div
              className="fa-paper-arrival"
              initial={
                reduced ? false : { x: -64, y: -18, rotate: -8, opacity: 0 }
              }
              animate={{
                x: printReady ? 0 : -64,
                y: printReady ? 0 : -18,
                rotate: printReady ? 0 : -8,
                opacity: printReady ? 1 : 0,
              }}
              transition={
                slowMotion(reduced
                  ? { duration: 0 }
                  : { duration: 0.7, ease: [0.22, 1, 0.36, 1] })
              }
            >
              <div className="fa-print-paper fa-print-observation">
                <span className="fa-paper-topline">VIEW / 01</span>
                <strong>{t("观察", "Observe")}</strong>
                <div className="fa-observation-mark" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <p>
                  {t("感知线索", "Perceptual clues")}
                  <br />
                  {t("车辆位置与姿态", "Vehicle position and pose")}
                </p>
              </div>
            </motion.div>
            <motion.div
              className="fa-paper-arrival"
              initial={
                reduced ? false : { x: 64, y: 24, rotate: 9, opacity: 0 }
              }
              animate={{
                x: printReady ? 0 : 64,
                y: printReady ? 0 : 24,
                rotate: printReady ? 0 : 9,
                opacity: printReady ? 1 : 0,
              }}
              transition={
                slowMotion(reduced
                  ? { duration: 0 }
                  : { duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] })
              }
            >
              <div className="fa-print-paper fa-print-coordination">
                <span className="fa-paper-topline">VIEW / 02</span>
                <strong>{t("共享", "Share")}</strong>
                <div className="fa-coordination-mark" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <p>
                  {t("地图与空间约束", "Maps and spatial constraints")}
                  <br />
                  {t("协同与决策研究", "Collaboration and decision research")}
                </p>
              </div>
            </motion.div>
            <motion.div
              className="fa-label-arrival"
              initial={reduced ? false : { scale: 1.12, opacity: 0 }}
              animate={{
                scale: printReady ? 1 : 1.12,
                opacity: printReady ? 1 : 0,
              }}
              transition={
                slowMotion(reduced
                  ? { duration: 0 }
                  : { duration: 0.35, delay: 0.55, ease: [0.22, 1, 0.36, 1] })
              }
            >
              <div className="fa-overlap-label">
                <Plus size={18} aria-hidden="true" />
                <span>
                  {t("把视角放在一起", "Bring viewpoints together")}
                  <br />
                </span>
              </div>
            </motion.div>
            <motion.div
              className="fa-print-caption"
              initial={reduced ? false : { y: 13, opacity: 0 }}
              animate={{
                y: printReady ? 0 : 13,
                opacity: printReady ? 1 : 0,
              }}
              transition={
                slowMotion(reduced
                  ? { duration: 0 }
                  : { duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] })
              }
            >
              <span>AVPC</span>
              <p>
                {t(
                  "感知 → 定位 → 协同",
                  "Perception → localisation → collaboration",
                )}
              </p>
            </motion.div>
          </motion.div>

          <div className="fa-controls">
            <label htmlFor="avpc-alignment">
              {t(
                "左右移动，探索我的工作 ",
                "Move the sheets to explore my work ",
              )}
              <MoveHorizontal size={18} aria-hidden="true" />
            </label>
            <input
              id="avpc-alignment"
              className="fa-range"
              type="range"
              min="0"
              max="100"
              value={alignment}
              aria-valuetext={currentCollaboration.title}
              onChange={(event) => { setAlignment(Number(event.target.value)); setCollaborationOpen(true); }}
            />
            <div
              className="fa-focus-buttons"
              role="group"
              aria-label={t(
                "阅读 AVPC 本人研究工作",
                "Read my AVPC research contributions",
              )}
            >
              <button
                type="button"
                aria-pressed={focus === "data"}
                onClick={() => { setAlignment(0); setCollaborationOpen(true); }}
              >
                {t("01 / 数据与真值", "01 / Data and ground truth")}
              </button>
              <button
                type="button"
                aria-pressed={focus === "constraints"}
                onClick={() => { setAlignment(50); setCollaborationOpen(true); }}
              >
                {t("02 / 共同约束", "02 / Shared constraints")}
              </button>
              <button
                type="button"
                aria-pressed={focus === "iteration"}
                onClick={() => { setAlignment(100); setCollaborationOpen(true); }}
              >
                {t("03 / 失败与迭代", "03 / Failure and iteration")}
              </button>
            </div>
          </div>

          <button type="button" className="future-reading-toggle fa-reading-toggle" aria-expanded={collaborationOpen} aria-controls="avpc-work-details" onClick={() => setCollaborationOpen(!collaborationOpen)}>{collaborationOpen ? t("收起工作记录", "Close work notes") : t("阅读我的工作", "Read my work")}{collaborationOpen ? <Minus size={16}/> : <Plus size={16}/>}</button>
          <AnimatePresence initial={false}>{collaborationOpen && <ReadingReveal
            id="avpc-work-details"
            className="fa-work-reading"
            aria-live="polite"
            initial={reduced ? false : { gridTemplateRows: "0fr", opacity: 0 }}
            animate={{ gridTemplateRows: "1fr", opacity: 1 }}
            exit={{ gridTemplateRows: "0fr", opacity: reduced ? 1 : 0 }}
            transition={
              slowMotion(reduced
                ? { duration: 0 }
                : { duration: 0.5, ease: [0.22, 1, 0.36, 1] })
            }
          >
            <span className="fa-work-number">
              {currentCollaboration.number}
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={focus}
                initial={reduced ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduced ? 0 : -8 }}
                transition={slowMotion(reveal)}
              >
                <h3>{currentCollaboration.title}</h3>
                <p>{currentCollaboration.description}</p>
                <div className="fa-keywords">
                  {currentCollaboration.keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </ReadingReveal>}</AnimatePresence>

          <div className="fa-current-boundary">
            <span>{t("当前进展", "Current stage")}</span>
            <p>
              {t("Gordon Owusu Boateng 团队 · 研究框架与仿真探索阶段，量化评估待推进。", "Gordon Owusu Boateng team · framework and simulation exploration, with quantitative evaluation ahead.")}
            </p>
          </div>
          <div className="fa-chapter-links">
            <a className="chapter-link" href="#cosmos">
              {t("回看我的定位实验 ", "Revisit my localisation experiments ")}
              <ArrowUpRight size={19} />
            </a>
            <a className="chapter-link" href="#archive">
              {t("回到我的完整经历 ", "Return to my full experience index ")}
              <ArrowDownRight size={19} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
