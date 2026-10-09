import { useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { ArrowDownRight, Layers3 } from "lucide-react";
import { useContent } from "../data/use-content";
import { useI18n } from "../i18n";
import "./sups-chapter.css";

type Layer = "numbers" | "roof" | "signs";
const getLayerRecords = (
  t: (zh: string, en: string) => string,
): {
  id: Layer;
  title: string;
  short: string;
  phrase: string;
  text: string;
  reason: string;
  status: string;
  color: string;
}[] => [
  {
    id: "numbers",
    title: t("车位编号", "Parking IDs"),
    short: "01 / LANDMARKS",
    phrase: t(
      "编号，是空间里可读的线索。",
      "Give the space a readable landmark.",
    ),
    text: t(
      "我补充停车位编号，让车位不只是相似的几何框线，也有可以被感知与定位研究检查的语义标记。",
      "I added parking-space identifiers so that similar geometric bays also carry semantic markers that can be examined in perception and localisation research.",
    ),
    reason: t(
      "编号与实际位置应当对应，才能讨论它对定位的作用。",
      "An identifier should correspond to its actual location before we can study its role in localisation.",
    ),
    status: t("已开展场景扩展", "Scene extension underway"),
    color: "#4f7a78",
  },
  {
    id: "roof",
    title: t("屋顶结构", "Roof structure"),
    short: "02 / STRUCTURE",
    phrase: t(
      "把停车场，变成封闭的空间。",
      "Make the parking scene an enclosed space.",
    ),
    text: t(
      "我参与补充屋顶结构，让基础场景更接近地下停车场。结构扩展与车位编号一起，构成后续研究的环境基础。",
      "I helped add a roof structure to bring the base scene closer to an underground parking environment. The structure and identifiers form part of the setting for further research.",
    ),
    reason: t(
      "场景条件可以被控制，环境变化与失败案例才有机会被分别研究。",
      "Controllable scene conditions make it possible to examine environmental changes and failure cases separately.",
    ),
    status: t("已开展结构扩展", "Structural extension underway"),
    color: "#a77364",
  },
  {
    id: "signs",
    title: t("导向与分区", "Wayfinding"),
    short: "03 / CONSISTENCY",
    phrase: t(
      "一个箭头，也要与空间说得通。",
      "Even an arrow must agree with the space.",
    ),
    text: t(
      "我研究道路导向、A/B 分区和箭头方向之间的空间一致性，让语义地标与几何关系保持对应。",
      "I study spatial consistency between road guidance, A/B zones and arrow directions, keeping semantic landmarks aligned with geometric relationships.",
    ),
    reason: t(
      "这些线索不是装饰。改变一个标志，应当知道它指向哪个分区与哪段道路。",
      "Changing a sign should mean knowing which zone and stretch of road it refers to.",
    ),
    status: t("研究与工程继续推进", "Research and development ongoing"),
    color: "#57709a",
  },
];

function point(x: number, y: number, z = 0) {
  return [445 + (x - y) * 43, 238 + (x + y) * 24 - z];
}
function polygon(points: number[][]) {
  return points.map((p) => p.join(",")).join(" ");
}
function plane(x: number, y: number, width: number, depth: number, z = 0) {
  return polygon([
    point(x, y, z),
    point(x + width, y, z),
    point(x + width, y + depth, z),
    point(x, y + depth, z),
  ]);
}

function Block({
  x,
  y,
  width,
  depth,
  height,
  fill,
  left,
  right,
  z = 0,
}: {
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  fill: string;
  left: string;
  right: string;
  z?: number;
}) {
  return (
    <g>
      <polygon
        points={polygon([
          point(x, y + depth, z),
          point(x + width, y + depth, z),
          point(x + width, y + depth, z + height),
          point(x, y + depth, z + height),
        ])}
        fill={left}
      />
      <polygon
        points={polygon([
          point(x + width, y, z),
          point(x + width, y + depth, z),
          point(x + width, y + depth, z + height),
          point(x + width, y, z + height),
        ])}
        fill={right}
      />
      <polygon points={plane(x, y, width, depth, z + height)} fill={fill} />
    </g>
  );
}

export function SupsChapter({ quiet = false }: { quiet?: boolean }) {
  const { language, t } = useI18n();
  const { projects } = useContent();
  const layerRecords = getLayerRecords(t);
  const project = projects.find((item) => item.id === "sups")!;
  const [selected, setSelected] = useState<Layer>("numbers");
  const reduce = useReducedMotion();
  const still = quiet || Boolean(reduce);
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const stageEntered = useInView(stageRef, { once: true, amount: 0.18 });
  const headingEntered = useInView(headingRef, { once: true, amount: 0.12 });
  const readingEntered = useInView(readingRef, { once: true, amount: 0.12 });
  const headingReady = still || headingEntered;
  const readingReady = still || readingEntered;
  const assembled = still || stageEntered;
  const active = layerRecords.find((layer) => layer.id === selected)!;
  const transition = {
    duration: still ? 0 : 0.65,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const roofY = selected === "roof" ? -46 : -105;

  return (
    <section
      id="sups"
      className={`chapter sups-chapter ${language === "en" ? "is-english" : ""}`}
      aria-labelledby="sups-title"
    >
      <div className="chapter-inner sups-inner">
        <div className="sups-masthead">
          <p className="chapter-kicker">
            {t("04 / 建立研究环境", "04 / BUILDING A RESEARCH ENVIRONMENT")}
          </p>
          <span>{t("2026.09 — 至今", "2026.09 — PRESENT")}</span>
        </div>
        <header className="sups-heading" ref={headingRef}>
          <div>
            <p className="sups-eyebrow">
              {t(
                "SUPS / SVL · 仿真与数据工程",
                "SUPS / SVL · SIMULATION & DATA ENGINEERING",
              )}
            </p>
            <motion.h2
              id="sups-title"
              initial={still ? false : { clipPath: "inset(0 0 100% 0)" }}
              animate={{
                clipPath: headingReady
                  ? "inset(0 0 0% 0)"
                  : "inset(0 0 100% 0)",
              }}
              transition={{
                duration: still ? 0 : 0.58,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {t("我为研究，", "I build a space")}
              <br />
              {t("搭一个可控制的空间。", "for controlled research.")}
            </motion.h2>
          </div>
          <p className="sups-heading-note">
            {t("跑通基础仿真链路，", "First, get the simulation running.")}
            <br />
            {t("再把编号、结构与标志", "Then give identifiers, structure")}
            <br />
            {t("放回它们应在的位置。", "and signs their place.")}
          </p>
        </header>

        <div
          className="sups-architecture"
          ref={stageRef}
          data-assembled={assembled}
        >
          <div className="sups-stage-note">
            <span className="sups-drawing-index">FIG. 02</span>
            <span>
              {t("场景扩展示意", "Scene-extension illustration")}
              <br />
              {t("非真实 SVL 截图", "Illustration, not an SVL capture")}
            </span>
          </div>
          <motion.svg
            className="sups-scene"
            viewBox="140 10 730 620"
            role="img"
            aria-labelledby="sups-scene-title sups-scene-description"
          >
            <title id="sups-scene-title">
              {t(
                "SUPS 停车场扩展的等距分层示意",
                "Isometric illustration of my SUPS scene extensions",
              )}
            </title>
            <desc id="sups-scene-description">
              {t(
                "车位编号、屋顶和道路分区三层表示我参与扩展的内容；选择下方对应按钮，结构与真实工作说明同步变化。",
                "Parking identifiers, roof and road zones represent extensions I worked on. Select a layer below to change the structure and read the corresponding work.",
              )}
            </desc>
            <defs>
              <filter
                id="sups-ground-shadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="14" />
              </filter>
              <pattern
                id="sups-drawing-grid"
                width="34"
                height="34"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 34 0 L 0 0 0 34"
                  fill="none"
                  stroke="#314d53"
                  strokeOpacity=".055"
                  strokeWidth=".8"
                />
              </pattern>
            </defs>
            <rect
              x="150"
              y="60"
              width="710"
              height="545"
              fill="url(#sups-drawing-grid)"
            />
            <motion.g
              className="sups-build-base"
              initial={false}
              animate={{ y: assembled ? 0 : 34, opacity: assembled ? 1 : 0 }}
              transition={{
                duration: still ? 0 : 0.34,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ellipse
                cx="503"
                cy="511"
                rx="268"
                ry="65"
                fill="#486b62"
                opacity=".14"
                filter="url(#sups-ground-shadow)"
              />
              <Block
                x={0}
                y={0}
                width={8}
                depth={5}
                z={-20}
                height={20}
                fill="#d8d4c6"
                left="#bfbbad"
                right="#a8b8ad"
              />
              <polygon
                points={plane(0.16, 0.15, 7.68, 4.7, 1)}
                fill="#e8e3d7"
              />
              <Block
                x={0}
                y={0}
                width={8}
                depth={0.16}
                height={42}
                fill="#d9d3c5"
                left="#c1bbad"
                right="#a6b4a8"
              />
              <Block
                x={0}
                y={0.16}
                width={0.16}
                depth={4.84}
                height={42}
                fill="#d9d3c5"
                left="#c1bbad"
                right="#a6b4a8"
              />
            </motion.g>

            <motion.g
              className="sups-build-road"
              initial={false}
              animate={{ opacity: assembled ? 1 : 0 }}
              transition={{
                duration: still ? 0 : 0.3,
                delay: still ? 0 : 0.24,
              }}
            >
              <motion.g
                animate={{ opacity: selected === "signs" ? 1 : 0.34 }}
                transition={transition}
              >
                <polygon
                  points={plane(0.16, 0.16, 3.84, 4.68, 2)}
                  fill="#dda18e"
                  opacity=".22"
                />
                <polygon
                  points={plane(4, 0.16, 3.84, 4.68, 2)}
                  fill="#7caca1"
                  opacity=".19"
                />
                <line
                  x1={point(4, 0.4)[0]}
                  y1={point(4, 0.4)[1]}
                  x2={point(4, 4.6)[0]}
                  y2={point(4, 4.6)[1]}
                  stroke="#718b80"
                  strokeWidth="2"
                  strokeDasharray="7 6"
                />
                {[1.6, 5.2].map((x) => (
                  <g key={x}>
                    <line
                      x1={point(x, 2.55, 2)[0]}
                      y1={point(x, 2.55, 2)[1]}
                      x2={point(x + 1.1, 2.55, 2)[0]}
                      y2={point(x + 1.1, 2.55, 2)[1]}
                      stroke="#698d83"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <polygon
                      points={polygon([
                        point(x + 1.35, 2.55, 2),
                        point(x + 0.87, 2.29, 2),
                        point(x + 0.87, 2.81, 2),
                      ])}
                      fill="#698d83"
                    />
                  </g>
                ))}
                <text
                  x={point(2.1, 2.45)[0]}
                  y={point(2.1, 2.45)[1] - 23}
                  className="sups-zone-text"
                  fill="#a77364"
                >
                  A
                </text>
                <text
                  x={point(6, 2.45)[0]}
                  y={point(6, 2.45)[1] - 23}
                  className="sups-zone-text"
                  fill="#4f7a78"
                >
                  B
                </text>
              </motion.g>
            </motion.g>

            <motion.g
              className="sups-build-numbers"
              initial={false}
              animate={{ y: assembled ? 0 : 15, opacity: assembled ? 1 : 0 }}
              transition={{
                duration: still ? 0 : 0.34,
                delay: still ? 0 : 0.27,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.g
                animate={{
                  y: selected === "numbers" ? -9 : 0,
                  opacity: selected === "numbers" ? 1 : 0.48,
                }}
                transition={transition}
              >
                {[0.48, 3.35].flatMap((y, row) =>
                  Array.from({ length: 5 }, (_, column) => {
                    const x = 0.7 + column * 1.4;
                    const center = point(x + 0.52, y + 0.7, 3);
                    return (
                      <g key={`${row}-${column}`}>
                        <polygon
                          points={plane(x, y, 1.08, 1.17, 3)}
                          fill={column % 2 === 0 ? "#d8e1d6" : "#dce3db"}
                          stroke="#6d9386"
                          strokeWidth="1.2"
                        />
                        <text
                          x={center[0]}
                          y={center[1] + 4}
                          textAnchor="middle"
                          className="sups-parking-number"
                        >
                          {row === 0 ? "A" : "B"}-
                          {String(column + 1).padStart(2, "0")}
                        </text>
                      </g>
                    );
                  }),
                )}
              </motion.g>
            </motion.g>

            {[
              { x: 0.22, y: 0.24 },
              { x: 3.84, y: 0.24 },
              { x: 7.51, y: 0.24 },
              { x: 0.22, y: 4.45 },
              { x: 7.51, y: 4.45 },
            ].map(({ x, y }, index) => (
              <motion.g
                className="sups-build-column"
                key={`${x}-${y}`}
                initial={false}
                style={{ originX: 0.5, originY: 1 }}
                animate={{
                  scaleY: assembled ? 1 : 0.03,
                  opacity: assembled ? 1 : 0,
                }}
                transition={{
                  duration: still ? 0 : 0.32,
                  delay: still ? 0 : 0.23 + index * 0.035,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Block
                  x={x}
                  y={y}
                  width={0.25}
                  depth={0.25}
                  height={116}
                  fill="#e5dfd0"
                  left="#c1b6a4"
                  right="#a8b5a4"
                />
              </motion.g>
            ))}

            <motion.g
              className="sups-build-signs"
              initial={false}
              animate={{ y: assembled ? 0 : 12, opacity: assembled ? 1 : 0 }}
              transition={{
                duration: still ? 0 : 0.32,
                delay: still ? 0 : 0.48,
              }}
            >
              <motion.g
                animate={{
                  y: selected === "signs" ? -10 : 0,
                  opacity: selected === "signs" ? 1 : 0.54,
                }}
                transition={transition}
              >
                <line
                  x1={point(4.25, 0.55)[0]}
                  y1={point(4.25, 0.55)[1]}
                  x2={point(4.25, 0.55, 90)[0]}
                  y2={point(4.25, 0.55, 90)[1]}
                  stroke="#87958a"
                  strokeWidth="3"
                />
                <g transform={`translate(${point(4.25, 0.55, 94).join(" ")})`}>
                  <rect
                    x="-37"
                    y="-16"
                    width="74"
                    height="29"
                    fill="#4f7a78"
                    rx="2"
                  />
                  <text
                    y="3"
                    textAnchor="middle"
                    className="sups-direction-text"
                  >
                    ← A · B →
                  </text>
                  <path
                    d="M -36 14 L 38 14 L 42 9 L 42 -14 L 38 -16 L 38 13"
                    fill="#355d5b"
                  />
                </g>
              </motion.g>
            </motion.g>

            <motion.g
              className="sups-build-roof"
              initial={false}
              animate={{ y: assembled ? 0 : -57, opacity: assembled ? 1 : 0 }}
              transition={{
                duration: still ? 0 : 0.4,
                delay: still ? 0 : 0.53,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.g
                animate={{
                  y: roofY,
                  opacity: selected === "roof" ? 0.95 : 0.24,
                }}
                transition={transition}
              >
                <Block
                  x={-0.12}
                  y={-0.12}
                  width={8.24}
                  depth={5.24}
                  z={118}
                  height={12}
                  fill="#9eb8ac"
                  left="#829e91"
                  right="#6d8b7f"
                />
                <polygon
                  points={plane(0.1, 0.08, 7.82, 4.82, 131)}
                  fill="#b9cabc"
                />
                {[1.75, 3.45].map((y) => (
                  <line
                    key={y}
                    x1={point(0.12, y, 132)[0]}
                    y1={point(0.12, y, 132)[1]}
                    x2={point(7.9, y, 132)[0]}
                    y2={point(7.9, y, 132)[1]}
                    stroke="#7e9b8d"
                    strokeOpacity=".65"
                    strokeWidth="1.2"
                  />
                ))}
                <line
                  x1={point(4, 0.12, 132)[0]}
                  y1={point(4, 0.12, 132)[1]}
                  x2={point(4, 4.84, 132)[0]}
                  y2={point(4, 4.84, 132)[1]}
                  stroke="#7e9b8d"
                  strokeOpacity=".65"
                  strokeWidth="1.2"
                />
              </motion.g>
            </motion.g>
            <motion.g
              initial={false}
              animate={{ opacity: assembled ? 1 : 0 }}
              transition={{
                duration: still ? 0 : 0.25,
                delay: still ? 0 : 0.74,
              }}
              className="sups-layer-callout"
            >
              {selected === "numbers" ? (
                <>
                  <path
                    d={`M ${point(5.42, 4, 4).join(" ")} L 698 556 L 817 556`}
                  />
                  <circle
                    cx={point(5.42, 4, 4)[0]}
                    cy={point(5.42, 4, 4)[1]}
                    r="3"
                  />
                  <text x="704" y="578">
                    {t("01 / 车位编号", "01 / PARKING IDs")}
                  </text>
                </>
              ) : selected === "roof" ? (
                <>
                  <path
                    d={`M ${point(6.5, 3.4, 130)[0]} ${point(6.5, 3.4, 130)[1] + roofY} L 733 216 L 818 216`}
                  />
                  <circle
                    cx={point(6.5, 3.4, 130)[0]}
                    cy={point(6.5, 3.4, 130)[1] + roofY}
                    r="3"
                  />
                  <text x="737" y="238">
                    {t("02 / 屋顶结构", "02 / ROOF")}
                  </text>
                </>
              ) : (
                <>
                  <path
                    d={`M ${point(4.25, 0.55, 85)[0]} ${point(4.25, 0.55, 85)[1] - 10} L 746 366 L 818 366`}
                  />
                  <circle
                    cx={point(4.25, 0.55, 85)[0]}
                    cy={point(4.25, 0.55, 85)[1] - 10}
                    r="3"
                  />
                  <text x="748" y="388">
                    {t("03 / 导向分区", "03 / WAYFINDING")}
                  </text>
                </>
              )}
            </motion.g>
          </motion.svg>
          <div className="sups-scene-side-note">
            <Layers3 size={16} strokeWidth={1} />
            <span>
              {t("一个真实的研究问题，", "A research question,")}
              <br />
              {t(
                "对应一层可控制的环境。",
                "a controllable layer of the scene.",
              )}
            </span>
          </div>
        </div>

        <div
          className="sups-layer-selector"
          aria-label={t(
            "选择我参与扩展的场景层",
            "Choose a scene layer I worked on",
          )}
        >
          {layerRecords.map((layer, index) => (
            <motion.button
              key={layer.id}
              type="button"
              className={selected === layer.id ? "is-selected" : ""}
              aria-pressed={selected === layer.id}
              aria-controls="sups-work-reading"
              onClick={() => setSelected(layer.id)}
              style={{ "--layer-color": layer.color } as CSSProperties}
              initial={still ? false : { y: 10, opacity: 0 }}
              animate={still ? { y: 0, opacity: 1 } : undefined}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: still ? 0 : 0.3,
                delay: still ? 0 : index * 0.055,
              }}
            >
              <span className="sups-layer-button-number">0{index + 1}</span>
              <span>
                <strong>{layer.title}</strong>
                <small>{layer.short.split(" / ")[1]}</small>
              </span>
              <i aria-hidden="true" />
            </motion.button>
          ))}
        </div>
        <div ref={readingRef} style={{ display: "flow-root" }}>
          <motion.div
            className="sups-work-reading"
            id="sups-work-reading"
            aria-live="polite"
            initial={still ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{
              clipPath: readingReady ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
            }}
            transition={{
              duration: still ? 0 : 0.44,
              delay: still ? 0 : 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected}
                className="sups-work-grid"
                initial={still ? false : { opacity: 0, y: 9 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: still ? 0 : 0.18 }}
              >
                <div className="sups-work-title">
                  <p style={{ color: active.color }}>
                    {active.short} / {t("我的扩展", "MY EXTENSION")}
                  </p>
                  <h3>{active.phrase}</h3>
                </div>
                <div className="sups-work-description">
                  <p>{active.text}</p>
                  <p className="sups-work-reason">{active.reason}</p>
                  <span className="sups-work-status">
                    <i style={{ background: active.color }} /> {active.status}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
        <div className="sups-foundation">
          <span>
            {t("起点：", "Foundation: ")}
            <strong>{t("基础仿真链路跑通", "Base simulation running")}</strong>
          </span>
          <span>
            {t("角色：", "Role: ")}
            <strong>{project.role}</strong>
          </span>
          <span>
            {t("目前：", "Status: ")}
            <strong>
              {t("仿真与数据工程进行中", "Simulation and data work ongoing")}
            </strong>
          </span>
        </div>
        <p className="sups-boundary">
          {t(
            "我扩展的是现有仿真平台。这里是对工作内容的原创示意；完整样本规模、统一标注与公开数据集发布尚未确认。",
            "I extend an existing simulation platform. This is an original illustration of the work; complete sample counts, unified annotation and public dataset release have not been confirmed.",
          )}
        </p>
        <footer className="sups-exits">
          <a className="chapter-link" href="#mask">
            {t(
              "接下来，把系统做成能演示的原型",
              "Next, build a prototype that can be demonstrated",
            )}{" "}
            <ArrowDownRight size={16} />
          </a>
          <a className="chapter-link" href="#glimpse">
            {t(
              "这些空间，也连接我的毕业研究",
              "These spaces also connect to my final-year research",
            )}{" "}
            <ArrowDownRight size={16} />
          </a>
        </footer>
      </div>
    </section>
  );
}
