import { ReadingReveal } from "./ReadingReveal";
import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { ArrowDownRight, Layers3 } from "lucide-react";
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
      "为车位添加语义标识。",
      "Add semantic identifiers to parking bays.",
    ),
    text: t(
      "在现有停车场场景中增加可识别的车位编号，为语义地标提取与位置推断提供场景元素。",
      "Added readable parking-space identifiers to the existing scene, providing landmarks for semantic extraction and position inference.",
    ),
    reason: t(
      "编号与实际位置应当对应，才能讨论它对定位的作用。",
      "An identifier should correspond to its actual location before we can study its role in localisation.",
    ),
    status: t("车位编号已扩展", "Parking identifiers added"),
    color: "#3047b9",
  },
  {
    id: "roof",
    title: t("屋顶结构", "Roof structure"),
    short: "02 / STRUCTURE",
    phrase: t(
      "补充地下停车场的建筑结构。",
      "Extend the enclosed parking structure.",
    ),
    text: t(
      "为原有停车场增加屋顶等建筑结构，使场景更接近地下或封闭停车场的视觉环境。",
      "Helped add a roof and architectural structure to bring the existing scene closer to the visual conditions of an underground or enclosed car park.",
    ),
    reason: t(
      "场景条件可以被控制，环境变化与失败案例才有机会被分别研究。",
      "Controllable scene conditions make it possible to examine environmental changes and failure cases separately.",
    ),
    status: t("屋顶结构已扩展", "Roof structure added"),
    color: "#993d2c",
  },
  {
    id: "signs",
    title: t("导向与分区", "Wayfinding"),
    short: "03 / CONSISTENCY",
    phrase: t(
      "让导向标志对应真实分区。",
      "Align wayfinding with the actual zones.",
    ),
    text: t(
      "推进左转、右转和区域导向的开发要求，检查 A/B 分区、道路位置与箭头方向的对应关系。",
      "Developing requirements for turning and zone guidance, checking the correspondence between A/B zones, road positions and arrow directions.",
    ),
    reason: t(
      "导向语义必须与空间布局一致，才能用于后续定位与场景理解。",
      "Wayfinding semantics must agree with the layout before they can support localisation and scene understanding.",
    ),
    status: t("导向一致性开发进行中", "Wayfinding consistency in progress"),
    color: "#283783",
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
  const layerRecords = getLayerRecords(t);
  const [selected, setSelected] = useState<Layer | null>(null);
  useCollapseOnLeave("sups", () => setSelected(null));
  const reduce = useReducedMotion();
  const still = quiet || Boolean(reduce);
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const stageEntered = useInView(stageRef, { once: false, amount: "some" });
  const headingEntered = useInView(headingRef, { once: false, amount: "some" });
  const selectorEntered = useInView(selectorRef, { once: false, amount: "some" });
  const headingReady = still || headingEntered;
  const selectorReady = still || selectorEntered;
  const assembled = still || stageEntered;
  const buildDelay = (entry: number, withdrawal: number) =>
    still ? 0 : assembled ? entry : withdrawal;
  const active = layerRecords.find((layer) => layer.id === selected);
  const transition = {
    duration: still ? 0 : 0.65,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const roofY = selected === null ? 0 : selected === "roof" ? -46 : -105;

  return (
    <section
      id="sups"
      className={`chapter sups-chapter ${language === "en" ? "is-english" : ""}`}
      aria-labelledby="sups-title"
    >
      <div className="chapter-inner sups-inner">
        <div className="sups-masthead">
          <p className="chapter-kicker">
            {t("04 / SUPS · 仿真场景扩展", "04 / SUPS · SIMULATION EXTENSIONS")}
          </p>
          <span>{t("2026.09 — 至今", "2026.09 — PRESENT")}</span>
        </div>
        <header className="sups-heading" ref={headingRef}>
          <div>
            <p className="sups-eyebrow">
              {t(
                "感知与定位 · 仿真研究环境",
                "SIMULATION FOR PERCEPTION & LOCALISATION",
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
              transition={slowMotion({
                duration: still ? 0 : 0.58,
                ease: [0.22, 1, 0.36, 1],
              })}
            >
              SUPS / SVL
              <span>{t("仿真场景扩展", "Scene Extensions")}</span>
            </motion.h2>
          </div>
          <div className="sups-heading-note">
            <p>{t("怎样构造语义标识与几何布局一致、可用于感知研究的停车场？", "How can a parking scene keep semantic landmarks aligned with its geometry for perception research?")}</p>
            <span>{t("我的角色", "MY ROLE")}</span>
            <strong>{t("仿真开发与场景扩展", "Simulation development & scene extension")}</strong>
            <small className="sups-project-status">{t("仿真与数据工程进行中", "Simulation and data work in progress")}</small>
          </div>
        </header>

        <div
          className="sups-architecture"
          ref={stageRef}
          data-assembled={assembled}
        >
          <div className="sups-stage-note">
            <span className="sups-drawing-index">FIG. 02</span>
            <span>
              {t("原创场景扩展示意", "Original scene-extension illustration")}
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
                  stroke="#202d5f"
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
              transition={slowMotion({
                duration: still ? 0 : assembled ? 0.34 : 0.4,
                delay: buildDelay(0, 0.36),
                ease: [0.22, 1, 0.36, 1],
              })}
            >
              <ellipse
                cx="503"
                cy="511"
                rx="268"
                ry="65"
                fill="#283783"
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
                fill="#fff3ca"
                left="#dfae55"
                right="#6d85cf"
              />
              <polygon
                points={plane(0.16, 0.15, 7.68, 4.7, 1)}
                fill="#fff4d4"
              />
              <Block
                x={0}
                y={0}
                width={8}
                depth={0.16}
                height={42}
                fill="#fff3ca"
                left="#dfae55"
                right="#6d85cf"
              />
              <Block
                x={0}
                y={0.16}
                width={0.16}
                depth={4.84}
                height={42}
                fill="#fff3ca"
                left="#dfae55"
                right="#6d85cf"
              />
            </motion.g>

            <motion.g
              className="sups-build-road"
              initial={false}
              animate={{ opacity: assembled ? 1 : 0 }}
              transition={slowMotion({
                duration: still ? 0 : 0.3,
                delay: buildDelay(0.24, 0.25),
              })}
            >
              <motion.g
                animate={{ opacity: selected === "signs" ? 1 : 0.34 }}
                transition={slowMotion(transition)}
              >
                <polygon
                  points={plane(0.16, 0.16, 3.84, 4.68, 2)}
                  fill="#df674f"
                  opacity=".22"
                />
                <polygon
                  points={plane(4, 0.16, 3.84, 4.68, 2)}
                  fill="#667edf"
                  opacity=".19"
                />
                <line
                  x1={point(4, 0.4)[0]}
                  y1={point(4, 0.4)[1]}
                  x2={point(4, 4.6)[0]}
                  y2={point(4, 4.6)[1]}
                  stroke="#3047b9"
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
                      stroke="#3047b9"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <polygon
                      points={polygon([
                        point(x + 1.35, 2.55, 2),
                        point(x + 0.87, 2.29, 2),
                        point(x + 0.87, 2.81, 2),
                      ])}
                      fill="#3047b9"
                    />
                  </g>
                ))}
                <text
                  x={point(2.1, 2.45)[0]}
                  y={point(2.1, 2.45)[1] - 23}
                  className="sups-zone-text"
                  fill="#993d2c"
                >
                  A
                </text>
                <text
                  x={point(6, 2.45)[0]}
                  y={point(6, 2.45)[1] - 23}
                  className="sups-zone-text"
                  fill="#3047b9"
                >
                  B
                </text>
              </motion.g>
            </motion.g>

            <motion.g
              className="sups-build-numbers"
              initial={false}
              animate={{ y: assembled ? 0 : 15, opacity: assembled ? 1 : 0 }}
              transition={slowMotion({
                duration: still ? 0 : 0.34,
                delay: buildDelay(0.27, 0.22),
                ease: [0.22, 1, 0.36, 1],
              })}
            >
              <motion.g
                animate={{
                  y: selected === "numbers" ? -9 : 0,
                  opacity: selected === null || selected === "numbers" ? 1 : 0.48,
                }}
                transition={slowMotion(transition)}
              >
                {[0.48, 3.35].flatMap((y, row) =>
                  Array.from({ length: 5 }, (_, column) => {
                    const x = 0.7 + column * 1.4;
                    const center = point(x + 0.52, y + 0.7, 3);
                    return (
                      <g key={`${row}-${column}`}>
                        <polygon
                          points={plane(x, y, 1.08, 1.17, 3)}
                          fill={column % 2 === 0 ? "#e7eafa" : "#fff3cd"}
                          stroke="#3047b9"
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
                transition={slowMotion({
                  duration: still ? 0 : 0.32,
                  delay: buildDelay(0.23 + index * 0.035, 0.13 + (4 - index) * 0.025),
                  ease: [0.22, 1, 0.36, 1],
                })}
              >
                <Block
                  x={x}
                  y={y}
                  width={0.25}
                  depth={0.25}
                  height={116}
                  fill="#fff3ca"
                  left="#dfae55"
                  right="#6d85cf"
                />
              </motion.g>
            ))}

            <motion.g
              className="sups-build-signs"
              initial={false}
              animate={{ y: assembled ? 0 : 12, opacity: assembled ? 1 : 0 }}
              transition={slowMotion({
                duration: still ? 0 : 0.32,
                delay: buildDelay(0.48, 0.08),
              })}
            >
              <motion.g
                animate={{
                  y: selected === "signs" ? -10 : 0,
                  opacity: selected === null || selected === "signs" ? 1 : 0.54,
                }}
                transition={slowMotion(transition)}
              >
                <line
                  x1={point(4.25, 0.55)[0]}
                  y1={point(4.25, 0.55)[1]}
                  x2={point(4.25, 0.55, 90)[0]}
                  y2={point(4.25, 0.55, 90)[1]}
                  stroke="#3047b9"
                  strokeWidth="3"
                />
                <g transform={`translate(${point(4.25, 0.55, 94).join(" ")})`}>
                  <rect
                    x="-37"
                    y="-16"
                    width="74"
                    height="29"
                    fill="#3047b9"
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
                    fill="#202d5f"
                  />
                </g>
              </motion.g>
            </motion.g>

            <motion.g
              className="sups-build-roof"
              initial={false}
              animate={{ y: assembled ? 0 : -57, opacity: assembled ? 1 : 0 }}
              transition={slowMotion({
                duration: still ? 0 : 0.4,
                delay: buildDelay(0.53, 0),
                ease: [0.22, 1, 0.36, 1],
              })}
            >
              <motion.g
                animate={{
                  y: roofY,
                  opacity: selected === null || selected === "roof" ? 0.95 : 0.24,
                }}
                transition={slowMotion(transition)}
              >
                <Block
                  x={-0.12}
                  y={-0.12}
                  width={8.24}
                  depth={5.24}
                  z={118}
                  height={12}
                  fill="#7d94ec"
                  left="#526bca"
                  right="#3047b9"
                />
                <polygon
                  points={plane(0.1, 0.08, 7.82, 4.82, 131)}
                  fill="#a9b8f4"
                />
                {[1.75, 3.45].map((y) => (
                  <line
                    key={y}
                    x1={point(0.12, y, 132)[0]}
                    y1={point(0.12, y, 132)[1]}
                    x2={point(7.9, y, 132)[0]}
                    y2={point(7.9, y, 132)[1]}
                    stroke="#283783"
                    strokeOpacity=".65"
                    strokeWidth="1.2"
                  />
                ))}
                <line
                  x1={point(4, 0.12, 132)[0]}
                  y1={point(4, 0.12, 132)[1]}
                  x2={point(4, 4.84, 132)[0]}
                  y2={point(4, 4.84, 132)[1]}
                  stroke="#283783"
                  strokeOpacity=".65"
                  strokeWidth="1.2"
                />
              </motion.g>
            </motion.g>
            <motion.g
              initial={false}
              animate={{ opacity: assembled ? 1 : 0 }}
              transition={slowMotion({
                duration: still ? 0 : 0.25,
                delay: buildDelay(0.74, 0),
              })}
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
              ) : selected === "signs" ? (
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
              ) : null}
            </motion.g>
          </motion.svg>
          <div className="sups-scene-side-note">
            <Layers3 size={16} strokeWidth={1} />
            <span>
              {t("编号 · 结构 · 导向", "Identifiers · structure · wayfinding")}
            </span>
          </div>
        </div>

        <div
          className="sups-layer-selector"
          ref={selectorRef}
          data-entry-state={selectorReady ? "present" : "reset"}
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
              aria-expanded={selected === layer.id}
              aria-controls="sups-work-reading"
              onClick={() => setSelected((current) => current === layer.id ? null : layer.id)}
              drag="y"
              dragSnapToOrigin dragTransition={slowDragRelease}
              dragConstraints={{ top: -44, bottom: 8 }}
              dragElastic={0.16}
              onDragEnd={(_, info) => {
                if (info.offset.y < -18) setSelected(layer.id);
              }}
              style={{ "--layer-color": layer.color } as CSSProperties}
              initial={still ? false : { y: 10, opacity: 0 }}
              animate={{ y: selectorReady ? 0 : 10, opacity: selectorReady ? 1 : 0 }}
              transition={slowMotion({
                duration: still ? 0 : 0.3,
                delay: still ? 0 : selectorReady ? index * 0.055 : (layerRecords.length - 1 - index) * 0.035,
              })}
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
        <p className="sups-operation">{t("向上抽取一层 / 点击 · 再点收回", "Pull a layer upward / click · Click again to close")}</p>
        <div id="sups-work-reading" aria-live="polite">
          <AnimatePresence initial={false}>
          {active && <ReadingReveal
            className="sups-work-reading"
            initial={{ gridTemplateRows: "0fr", opacity: 0 }}
            animate={{ gridTemplateRows: "1fr", opacity: 1 }}
            exit={{ gridTemplateRows: "0fr", opacity: 0 }}
            transition={slowMotion({
              duration: still ? 0 : 0.44,
              delay: still ? 0 : 0.08,
              ease: [0.22, 1, 0.36, 1],
            })}
          >
            <div className="reading-switch"><AnimatePresence initial={false}>
              <motion.div
                key={selected}
                className="sups-work-grid"
                initial={still ? false : { opacity: 0, y: 9 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={slowMotion({ duration: still ? 0 : 0.18 })}
              >
                <div className="sups-work-title">
                  <p style={{ color: active.color }}>
                    {active.short} / {t("我的扩展", "MY EXTENSION")}
                  </p>
                  <h3>{active.phrase}</h3>
                </div>
                <div className="sups-work-description">
                  <p>{active.text}</p>
                  <details className="sups-work-reason">
                    <summary>{t("研究意义", "Why this layer matters")}</summary>
                    <p>{active.reason}</p>
                  </details>
                  <span className="sups-work-status">
                    <i style={{ background: active.color }} /> {active.status}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence></div>
          </ReadingReveal>}
          </AnimatePresence>
        </div>
        <div className="sups-foundation">
          <span>
            {t("已跑通：", "Running: ")}
            <strong>{t("基础仿真链路跑通", "Base simulation running")}</strong>
          </span>
          <span>
            {t("已扩展：", "Added: ")}
            <strong>
              {t("车位编号与屋顶结构", "Parking identifiers and roof structure")}
            </strong>
          </span>
        </div>
        <details className="sups-boundary">
          <summary>{t("场景与数据范围", "Scene & data scope")}</summary>
          <p>{t(
            "基于现有 SUPS / SVL 平台，使用 Codex 协作开发场景。图中为工作示意；完整样本规模、统一标注与公开数据集发布尚未确认。",
            "The scene extends the existing SUPS / SVL platform with Codex-assisted development. This is a work illustration; complete sample counts, unified annotation and a public dataset release have not been confirmed.",
          )}</p>
        </details>
        <footer className="sups-exits">
          <a className="chapter-link" href="#avpc">
            {t(
              "下一项目：AVPC 协同感知",
              "Next: AVPC collaborative perception",
            )}{" "}
            <ArrowDownRight size={16} />
          </a>
          <a className="chapter-link" href="#glimpse">
            {t(
              "相关毕业研究：U-IMPROVE",
              "Related final-year research: U-IMPROVE",
            )}{" "}
            <ArrowDownRight size={16} />
          </a>
        </footer>
      </div>
    </section>
  );
}
