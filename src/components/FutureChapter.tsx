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
  Plus,
} from "lucide-react";
import { useI18n } from "../i18n";
import "./future-chapter.css";

interface FutureChapterProps {
  quiet?: boolean;
}

type GenerationRoute = "rgb" | "latent";
type CollaborationFocus = "data" | "constraints" | "iteration";

const getRouteCopy = (t: (zh: string, en: string) => string) =>
  ({
    rgb: {
      title: t("先生成，再确定性解码。", "Generate, then decode."),
      description: t(
        "输入 RGB 图像和文字任务，探索把生成的像素对齐结果解码为分割遮罩或度量深度。我的研究重点之一，是 strip-assisted 分割与解码策略。",
        "Given an RGB image and a text task, I investigate decoding pixel-aligned generated outputs into segmentation masks or metric depth. Strip-assisted segmentation and decoding is one of my research directions.",
      ),
      next: t(
        "待验证：生成结果的稳定性、解码质量，以及未见类别与未见环境的表现。",
        "To validate: output stability, decoding quality, and performance on unseen categories and environments.",
      ),
      label: t("RGB 感知输出", "RGB perception output"),
      layer: t("像素对齐的视觉编码", "Pixel-aligned visual code"),
      decoder: t("Strip / 确定性解码", "Strip / deterministic decode"),
    },
    latent: {
      title: t("也在探索，更短的路径。", "Exploring a shorter route, too."),
      description: t(
        "除了完整 RGB 生成，我研究从生成模型的视觉 latent 或 token 中直接解码的可能性，让感知任务不必经过整张图像的生成。",
        "Alongside full RGB generation, I explore direct decoding from visual latents or tokens, so perception may not require generating an entire image.",
      ),
      next: t(
        "待验证：表示是否保留足够语义与几何信息，以及能否实际减少生成开销。",
        "To validate: whether the representation retains enough semantic and geometric information, and whether it actually reduces generation cost.",
      ),
      label: t("Latent / token 解码", "Latent / token decoding"),
      layer: t("模型内部视觉表示", "Internal visual representation"),
      decoder: t("直接解码 · 拟探索", "Direct decoding · proposed"),
    },
  }) as const;

const getCollaborationCopy = (t: (zh: string, en: string) => string) =>
  ({
    data: {
      number: "01",
      title: t(
        "我先检查，数据能不能验证位置。",
        "First, I check what the data can verify.",
      ),
      description: t(
        "参与停车与驾驶数据集筛选，特别检查是否提供车辆位置或姿态 Ground Truth。视觉线索再丰富，没有可靠真值，也难以判断定位方案是否有效。",
        "I help screen parking and driving datasets, checking whether they provide vehicle position or pose ground truth. Reliable reference labels are essential for evaluating a localisation method.",
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
        "我参与，把观察变成空间约束。",
        "I help turn observations into constraints.",
      ),
      description: t(
        "在感知和定位方案讨论中，研究语义地标、类别、距离、方位与地图拓扑怎样对应；共享的信息相互冲突时，也需要保留问题与检查条件。",
        "In perception and localisation discussions, I explore how semantic landmarks, categories, distances, bearings and map topology relate. Conflicting shared observations need to remain visible for consistency checks.",
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
        "我探索，让失败成为下一轮的问题。",
        "I explore what a failure can teach us.",
      ),
      description: t(
        "参与仿真探索与闭环研究框架讨论：用复杂、长尾或易混淆场景检查方案，再把失败反馈到新的数据与验证。协同决策与资源优化仍需要进一步研究。",
        "I participate in simulation exploration and discussions of a closed-loop framework: examine difficult, long-tail or ambiguous scenes, then use failures to guide new data and validation. Collaborative decision-making and resource optimisation require further research.",
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
  const [route, setRoute] = useState<GenerationRoute>("rgb");
  const [expression, setExpression] = useState(0);
  const [alignment, setAlignment] = useState(50);
  const expressionStart = useRef(0);
  const alignmentStart = useRef(50);
  const glassRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const glassInView = useInView(glassRef, { once: true, amount: 0.25 });
  const printInView = useInView(printRef, { once: true, amount: 0.25 });
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
  }

  function moveAlignment(_: unknown, info: PanInfo) {
    setAlignment(bounded(alignmentStart.current + info.offset.x * 0.42));
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
            initial={reduced ? false : { x: -20, opacity: 0.55 }}
            animate={reduced ? { x: 0, opacity: 1 } : undefined}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.58, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <div>
              <p className="fg-project-name">U-GLIMPSE</p>
              <h2 id="glimpse-title">
                {t("我正在把生成，", "I am connecting")}
                <br />
                {t("与感知连接起来。", "generation with perception.")}
              </h2>
            </div>
            <div className="fg-personal">
              <p className="fg-role">
                {t("2026.08/09 — 至今", "Aug/Sep 2026 — present")}
                <br />
                {t("PSP305 / 本科毕业设计", "PSP305 / Final-year project")}
                <br />
                {t(
                  "Gordon Owusu Boateng 指导",
                  "Supervised by Gordon Owusu Boateng",
                )}
              </p>
              <p>
                {t(
                  "图像生成模型学到的语义与几何先验，能否变成可以明确解码的视觉感知结果？这是我现在的研究问题。",
                  "Can the semantic and geometric priors learned by image generators become explicitly decodable perception outputs? This is the question I am working on.",
                )}
              </p>
            </div>
          </motion.div>

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
                "选择 U-GLIMPSE 生成路线",
                "Choose a U-GLIMPSE generation route",
              )}
            >
              <button
                type="button"
                aria-pressed={route === "rgb"}
                className={route === "rgb" ? "is-selected" : ""}
                onClick={() => setRoute("rgb")}
              >
                <span>01</span>
                {t(" RGB 感知输出", " RGB perception output")}
              </button>
              <button
                type="button"
                aria-pressed={route === "latent"}
                className={route === "latent" ? "is-selected" : ""}
                onClick={() => setRoute("latent")}
              >
                <span>02</span> Latent / token
              </button>
            </div>
          </div>

          <div className="fg-blueprint">
            <div className="fg-material-column">
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
                  initial={reduced ? false : { opacity: 0.2 }}
                  animate={{ opacity: glassReady ? 1 : 0.2 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.7 }}
                />
                <motion.div
                  className="fg-stage-label"
                  initial={reduced ? false : { x: -12, opacity: 0.5 }}
                  animate={{
                    x: glassReady ? 0 : -12,
                    opacity: glassReady ? 1 : 0.5,
                  }}
                  transition={reduced ? { duration: 0 } : { duration: 0.45 }}
                >
                  <span>RESEARCH BLUEPRINT</span>
                  <span>{representation3D ? "2D → 3D" : "PIXEL-ALIGNED"}</span>
                </motion.div>
                <motion.div
                  className="fg-layer-arrival fg-layer-arrival-input"
                  initial={
                    reduced
                      ? false
                      : { x: -24, y: 28, scale: 0.98, opacity: 0.35 }
                  }
                  animate={{
                    x: glassReady ? 0 : -24,
                    y: glassReady ? 0 : 28,
                    scale: glassReady ? 1 : 0.98,
                    opacity: glassReady ? 1 : 0.35,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.58, delay: 0, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <motion.div
                    className="fg-glass-layer fg-layer-input"
                    animate={{
                      y: -expression * 0.15,
                      rotate: -5 - expression * 0.015,
                    }}
                    transition={reveal}
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
                      : { x: 20, y: 25, scale: 0.98, opacity: 0.35 }
                  }
                  animate={{
                    x: glassReady ? 0 : 20,
                    y: glassReady ? 0 : 25,
                    scale: glassReady ? 1 : 0.98,
                    opacity: glassReady ? 1 : 0.35,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.58,
                          delay: 0.15,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                >
                  <motion.div
                    className="fg-glass-layer fg-layer-generation"
                    animate={{
                      y: -expression * 0.06,
                      rotate: expression * 0.025,
                    }}
                    transition={reveal}
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
                      : { x: -16, y: 26, scale: 0.98, opacity: 0.35 }
                  }
                  animate={{
                    x: glassReady ? 0 : -16,
                    y: glassReady ? 0 : 26,
                    scale: glassReady ? 1 : 0.98,
                    opacity: glassReady ? 1 : 0.35,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.58, delay: 0.3, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <motion.div
                    className="fg-glass-layer fg-layer-decoding"
                    animate={{
                      y: expression * 0.05,
                      rotate: 5 + expression * 0.02,
                    }}
                    transition={reveal}
                  >
                    <span className="fg-layer-index">DECODING / 03</span>
                    <strong>{currentRoute.decoder}</strong>
                    <p>
                      {route === "rgb"
                        ? t(
                            "从视觉编码恢复感知结果",
                            "Recover perception from visual codes",
                          )
                        : t(
                            "探索直接读取视觉表示",
                            "Explore reading visual representations",
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
                      : { x: 18, y: 24, scale: 0.98, opacity: 0.35 }
                  }
                  animate={{
                    x: glassReady ? 0 : 18,
                    y: glassReady ? 0 : 24,
                    scale: glassReady ? 1 : 0.98,
                    opacity: glassReady ? 1 : 0.35,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.58,
                          delay: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                >
                  <motion.div
                    className="fg-glass-layer fg-layer-expression"
                    animate={{
                      y: expression * 0.18,
                      rotate: 2 + expression * 0.015,
                    }}
                    transition={reveal}
                  >
                    <span className="fg-layer-index">REPRESENTATION / 04</span>
                    <strong>
                      {representation3D
                        ? t(
                            "拟探索：语义与几何融合",
                            "Proposed: semantic geometry",
                          )
                        : t("2D：分割与度量深度", "2D: segmentation and depth")}
                    </strong>
                    <p>
                      {representation3D
                        ? t(
                            "点云 / BEV / 体素 / 占据表达",
                            "Point cloud / BEV / voxels / occupancy",
                          )
                        : t(
                            "像素级遮罩与距离信息",
                            "Pixel-level masks and distance",
                          )}
                    </p>
                    <span className="fg-expression-symbol" aria-hidden="true">
                      {representation3D ? "◇" : "□"}
                    </span>
                  </motion.div>
                </motion.div>
                <span className="fg-blueprint-note">
                  {t(
                    "方法关系示意 · 不是模型运行结果",
                    "Method diagram · not model inference",
                  )}
                </span>
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
                    "左右拖动蓝图或滑块，阅读 2D / 拟研究 3D 表达",
                    "Drag the blueprint or slider to read about 2D and proposed 3D representations",
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
                  onChange={(event) =>
                    setExpression(Number(event.target.value))
                  }
                />
                <div className="fg-range-endpoints">
                  <button
                    type="button"
                    aria-pressed={!representation3D}
                    onClick={() => setExpression(0)}
                  >
                    {t("2D 分割 / 深度", "2D masks / depth")}
                  </button>
                  <button
                    type="button"
                    aria-pressed={representation3D}
                    onClick={() => setExpression(100)}
                  >
                    {t("3D 表达 · 拟研究", "3D representation · proposed")}
                  </button>
                </div>
              </div>
            </div>

            <motion.div
              className="fg-research-reading"
              aria-live="polite"
              initial={reduced ? false : { x: 18, opacity: 0.55 }}
              animate={reduced ? { x: 0, opacity: 1 } : undefined}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <p className="fg-reading-number">
                A{route === "rgb" ? "1" : "2"} / B{representation3D ? "2" : "1"}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${route}-${representation3D}`}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -6 }}
                  transition={reveal}
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
                            "在 2D 结果基础上，拟探索语义点云、BEV、体素或占据表达。它是进阶表示层，尚需训练与定量验证。",
                            "Building on 2D outputs, I plan to explore semantic point clouds, BEV, voxels or occupancy. This is an additional representation layer that still needs training and quantitative validation.",
                          )
                        : t(
                            "以像素级分割和度量深度为基础，研究目标是否存在、在哪里，以及怎样恢复可以被程序读取的结果。",
                            "Starting from pixel-level segmentation and metric depth, I investigate whether a target exists, where it is, and how to recover outputs a program can read.",
                          )}
                    </p>
                  </div>
                  <p className="fg-pending">{currentRoute.next}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            className="fg-progress-line"
            initial={reduced ? false : { y: 18, opacity: 0.6 }}
            animate={reduced ? { y: 0, opacity: 1 } : undefined}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.48, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <div>
              <span>{t("我已推进", "What I have developed")}</span>
              <p>
                {t(
                  "课题定位、文献调研、任务定义、数据划分与实验设计。",
                  "Research framing, literature review, task definitions, data splits and experimental design.",
                )}
              </p>
            </div>
            <div>
              <span>{t("我要怎样检验", "How I plan to evaluate")}</span>
              <p>
                {t(
                  "把地下停车场作为未见环境评估域，区分类别迁移和场景迁移。",
                  "Use underground parking as an unseen evaluation domain, distinguishing category transfer from environment transfer.",
                )}
              </p>
            </div>
            <div>
              <span>{t("尚待验证", "Still to validate")}</span>
              <p>
                {t(
                  "Strip 方法、完整模型实验、跨域指标与 3D 表达；暂无最终论文成果。",
                  "Strip methods, full model experiments, cross-domain metrics and 3D representations; no final publication is claimed.",
                )}
              </p>
            </div>
          </motion.div>
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
            initial={reduced ? false : { x: 22, opacity: 0.55 }}
            animate={reduced ? { x: 0, opacity: 1 } : undefined}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.58, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <h2 id="avpc-title">
              {t("我在团队里，", "Within the team,")}
              <br />
              {t("继续研究协同。", "I keep exploring collaboration.")}
            </h2>
            <div>
              <p className="fa-project-name">AVPC / COLLABORATIVE PERCEPTION</p>
              <p>
                {t(
                  "Gordon Owusu Boateng 团队 · 研究参与者",
                  "Gordon Owusu Boateng team · research participant",
                )}
              </p>
              <p className="fa-intro-copy">
                {t(
                  "不同视角带来局部观察。我参与数据、感知定位方案和仿真探索，研究怎样把它们放到可以检查的共同约束里。",
                  "Different viewpoints offer partial observations. I participate in data screening, perception and localisation discussions, and simulation exploration, investigating how observations can share checkable constraints.",
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
                reduced ? false : { x: -64, y: -18, rotate: -8, opacity: 0.5 }
              }
              animate={{
                x: printReady ? 0 : -64,
                y: printReady ? 0 : -18,
                rotate: printReady ? 0 : -8,
                opacity: printReady ? 1 : 0.5,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
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
                reduced ? false : { x: 64, y: 24, rotate: 9, opacity: 0.5 }
              }
              animate={{
                x: printReady ? 0 : 64,
                y: printReady ? 0 : 24,
                rotate: printReady ? 0 : 9,
                opacity: printReady ? 1 : 0.5,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }
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
              initial={reduced ? false : { scale: 1.12, opacity: 0.35 }}
              animate={{
                scale: printReady ? 1 : 1.12,
                opacity: printReady ? 1 : 0.35,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.35, delay: 0.55, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <div className="fa-overlap-label">
                <Plus size={18} aria-hidden="true" />
                <span>
                  {t("把视角放在一起", "Bring viewpoints together")}
                  <br />
                  <small>
                    {t("研究关系示意", "Research relationship diagram")}
                  </small>
                </span>
              </div>
            </motion.div>
            <motion.div
              className="fa-print-caption"
              initial={reduced ? false : { y: 13, opacity: 0.5 }}
              animate={{
                y: printReady ? 0 : 13,
                opacity: printReady ? 1 : 0.5,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <span>AVPC</span>
              <p>
                {t(
                  "感知 → 定位 → 协同",
                  "Perception → localisation → collaboration",
                )}
                <br />
                {t(
                  "各模块仍需分别验证",
                  "Each module needs its own validation",
                )}
              </p>
            </motion.div>
          </motion.div>

          <div className="fa-controls">
            <label htmlFor="avpc-alignment">
              {t(
                "移动研究页，阅读我参与的工作 ",
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
              onChange={(event) => setAlignment(Number(event.target.value))}
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
                onClick={() => setAlignment(0)}
              >
                {t("01 / 数据与真值", "01 / Data and ground truth")}
              </button>
              <button
                type="button"
                aria-pressed={focus === "constraints"}
                onClick={() => setAlignment(50)}
              >
                {t("02 / 共同约束", "02 / Shared constraints")}
              </button>
              <button
                type="button"
                aria-pressed={focus === "iteration"}
                onClick={() => setAlignment(100)}
              >
                {t("03 / 失败与迭代", "03 / Failure and iteration")}
              </button>
            </div>
          </div>

          <motion.div
            className="fa-work-reading"
            aria-live="polite"
            initial={reduced ? false : { y: 18, opacity: 0.6 }}
            animate={reduced ? { y: 0, opacity: 1 } : undefined}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
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
                transition={reveal}
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
          </motion.div>

          <div className="fa-current-boundary">
            <span>{t("当前进展", "Current stage")}</span>
            <p>
              {t(
                "导师团队持续研究方向，已有数据筛选、方案讨论与仿真探索。完整停车资源优化系统及量化收益尚未确认；Cosmos-Loc 的定位指标不作为这里的协同优化成果。",
                "This is an ongoing team research direction, with dataset screening, framework discussions and simulation exploration. A complete parking-resource optimisation system and quantified benefits are not yet confirmed. Cosmos-Loc localisation metrics are not claimed as collaborative optimisation results.",
              )}
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
