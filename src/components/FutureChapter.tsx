import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Minus, Plus, MoveHorizontal } from "lucide-react";
import { useI18n } from "../i18n";
import { useContent } from "../data/use-content";
import { slowMotion } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { GlimpsePerception } from "./GlimpsePerception";
import { ReadingReveal } from "./ReadingReveal";
import { useScenePresence } from "../hooks/useScenePresence";
import "./future-chapter.css";

type Translate = (zh: string, en: string) => string;
type GenerationRoute = "diffusion" | "autoregressive";
const getRoutes = (t: Translate) => ({
  diffusion: {
    title: t("扩散式图像生成", "Diffusion image generation"),
    text: t("RGB 与语言指令作为条件，从噪声逐步恢复任务图像，再确定性解码感知结果。计划对比单任务、联合任务与联合后专项微调。", "RGB and language condition the gradual recovery of a task image from noise, followed by deterministic perception decoding. Planned comparisons cover single-task, joint-task and joint-then-specialised tuning."),
  },
  autoregressive: {
    title: t("自回归式图像生成", "Autoregressive image generation"),
    text: t("Transformer 根据图像和文字生成视觉 token，先解码成 RGB 任务图像，再恢复感知结果。具体骨干选择和训练效果仍需验证。", "A Transformer generates visual tokens from image and text inputs. These decode into an RGB task image, then into perception outputs. Backbone selection and training performance remain to be validated."),
  },
});
const getCollaboration = (t: Translate) => [
  { title: t("先确认观察的依据。", "Establish the observation."), text: t("我参与筛选带车辆位置或姿态真值的数据集，核对场景、参考坐标与验证条件。图中的车辆与地标表示不同观察来源。", "I help screen datasets with vehicle position or pose ground truth, checking scenes, reference coordinates and validation conditions. The vehicles and landmarks illustrate separate observation sources."), tags: [t("数据集筛选", "Dataset screening"), t("位姿真值", "Pose ground truth")] },
  { title: t("用共同地标连接视角。", "Connect views through shared landmarks."), text: t("在团队方案讨论中，我研究语义地标、距离与方位如何对应地图约束。共同地标把局部观察联系起来；观察不一致时需要保留冲突。", "In team discussions, I examine how semantic landmarks, distances and bearings relate to map constraints. Shared landmarks connect local views; inconsistent observations must retain their conflicts."), tags: [t("语义地标", "Semantic landmarks"), t("空间一致性", "Spatial consistency")] },
  { title: t("把冲突送回下一轮验证。", "Return conflicts to the next test."), text: t("我参与仿真与闭环框架探索，用复杂或长尾条件检查方案，再用失败样例组织下一轮场景和评估。停车资源优化属于团队研究目标，尚无确认的量化收益。", "I contribute to simulation and closed-loop framework exploration, using difficult or long-tail conditions to guide the next scenes and evaluations. Parking-resource optimisation is a team research goal with no confirmed quantified benefit."), tags: [t("仿真条件", "Simulation conditions"), t("失败再验证", "Failure re-evaluation")] },
];

function PerceptionResearch({ quiet }: { quiet: boolean }) {
  const { t } = useI18n();
  const { projects } = useContent();
  const project = projects.find(p => p.id === "glimpse")!;
  const [route, setRoute] = useState<GenerationRoute>("diffusion");
  const [open, setOpen] = useState(false);
  useCollapseOnLeave("glimpse", () => setOpen(false));
  const copy = getRoutes(t)[route];
  return <section id="glimpse" className={`chapter future-glimpse${quiet ? " is-quiet" : ""}`} aria-labelledby="glimpse-title">
    <div className="chapter-inner">
      <div className="fg-heading-row"><p className="chapter-kicker">{t("02 / 本科毕业研究", "02 / FINAL-YEAR RESEARCH")}</p><span className="fg-status"><span/>{t("研究进行中", "Research in progress")}</span></div>
      <div className="fg-introduction"><div><p className="fg-project-name">{t("图像生成 · 开放词汇感知", "IMAGE GENERATION · OPEN-VOCABULARY PERCEPTION")}</p><h2 id="glimpse-title">U-IMPROVE</h2><p className="fg-project-question">{t("生成模型能看懂目标，也能说清它不存在吗？", "Can a generator perceive a target—and recognise its absence?")}</p></div><div className="fg-personal"><p className="fg-role">{t("本人毕业设计 · PSP305", "MY DISSERTATION · PSP305")}</p><p>{t("RGB 与语言 → 像素级感知 → 可查询三维场景。", "RGB and language → pixel-level perception → queryable 3D scenes.")}</p><span className="fg-supervisor">{project.year} · Gordon Owusu Boateng</span></div></div>
      <GlimpsePerception quiet={quiet}/>
      <div className="fg-study-layout">
        <div className="fg-research-protocol"><h3>{t("我在研究什么", "The research design")}</h3><ol>
          <li><strong>{t("一个共享骨干", "One shared backbone")}</strong><p>{t("生成 RGB 编码的分割、度量深度与法线；任务解码器恢复可检查的输出，掩码可导出检测框。", "Generate RGB-encoded segmentation, metric depth and normals; task decoders recover checkable outputs, with detection boxes derived from masks.")}</p></li>
          <li><strong>{t("显式目标状态", "Explicit target status")}</strong><p>{t("Presence-Aware Metadata Strip 区分 present、absent 和 uncertain，使负查询成为评估的一部分。", "A Presence-Aware Metadata Strip distinguishes present, absent and uncertain, making negative queries part of evaluation.")}</p></li>
          <li><strong>{t("跨环境与类别检验", "Environment and category transfer")}</strong><p>{t("计划覆盖通用、道路、地下停车场；对比感知微调中已见/未见类别、固定/自然指令及正/负查询。", "Planned tests cover general, road and underground-parking scenes, categories seen/held out during perception fine-tuning, fixed/natural instructions and positive/negative queries.")}</p></li>
        </ol></div>
        <div className="fg-research-reading">
          <p className="fg-reading-number">{t("拟比较的生成路线", "BACKBONES TO COMPARE")}</p><h3>{t("怎样生成感知结果？", "How should perception be generated?")}</h3>
          <div className="fg-route-switch" role="group" aria-label={t("选择生成路线", "Choose a generation route")}>
            <button aria-pressed={route === "diffusion"} className={route === "diffusion" ? "is-selected" : ""} onClick={() => { setRoute("diffusion"); setOpen(true); }}>{t("扩散式", "Diffusion")}</button>
            <button aria-pressed={route === "autoregressive"} className={route === "autoregressive" ? "is-selected" : ""} onClick={() => { setRoute("autoregressive"); setOpen(true); }}>{t("自回归式", "Autoregressive")}</button>
          </div>
          <button className="future-reading-toggle" aria-expanded={open} aria-controls="glimpse-research-details" onClick={() => setOpen(!open)}>{open ? t("合上方案", "Close the design") : t("阅读方案", "Read the design")}{open ? <Minus size={16}/> : <Plus size={16}/>}</button>
          <AnimatePresence initial={false}>{open && <ReadingReveal id="glimpse-research-details" className="future-details" initial={{ opacity: 0, gridTemplateRows: "0fr" }} animate={{ opacity: 1, gridTemplateRows: "1fr" }} exit={{ opacity: 0, gridTemplateRows: "0fr" }} transition={slowMotion({ duration: quiet ? 0 : .32 })}>
            <h4>{copy.title}</h4><p>{copy.text}</p><h4>{t("三维抬升的条件", "Conditions for 3D lifting")}</h4><p>{t("度量深度与相机内参 K 恢复相机坐标系中的 3D 点，再附加查询语义。语义点云是拟议核心表达；BEV、体素、占据与多帧融合属于后续扩展。", "Metric depth and camera intrinsics K recover points in the camera frame, with query semantics attached. Semantic point clouds are the proposed core representation; BEV, voxels, occupancy and multi-frame fusion remain later extensions.")}</p>
          </ReadingReveal>}</AnimatePresence>
        </div>
      </div>
      <div className="fg-evaluation" aria-label={t("计划评估指标", "Planned evaluation metrics")}><p>{t("评估计划 · 最终实验结果待验证", "EVALUATION PLAN · FINAL RESULTS PENDING")}</p><div><span><strong>FPR ↓</strong><small>{t("不存在目标的误报", "False positives on absent targets")}</small></span><span><strong>IoU ↑</strong><small>{t("分割掩码重叠", "Segmentation mask overlap")}</small></span><span><strong>AbsRel ↓</strong><small>{t("度量深度误差", "Metric-depth error")}</small></span></div></div>
      <details className="fg-source-framework"><summary>{t("完整框架与正式课题", "Full framework and formal topic")}</summary><figure><img src="/research/u-improve-framework.png" loading="lazy" alt={t("U-IMPROVE 拟议框架：生成任务图像，确定性解码，结合相机标定构建语义三维点。", "Proposed U-IMPROVE framework: generated task images, deterministic decoding and calibrated semantic 3D points.")}/><figcaption>{t("本人研究方案图，尚待训练与实验验证。", "My proposed research framework, requiring training and experimental validation.")}</figcaption></figure><p className="fg-formal-title">Image-Generation-Based Open-Vocabulary Object Detection for Driving Environment Perception in Underground Parking Lots</p></details>
      <a className="chapter-link fg-next-link" href="#cosmos">{t("此前的研究：视觉定位与模型实验", "Earlier work: visual localisation and model experiments")}<ArrowDownRight size={19}/></a>
    </div>
  </section>;
}

function CollaborativeResearch({ quiet }: { quiet: boolean }) {
  const { t } = useI18n();
  const [alignment, setAlignment] = useState(0);
  const [open, setOpen] = useState(false);
  const dragStart = useRef(0);
  const scene = useRef<HTMLDivElement>(null);
  const scenePresent = useScenePresence(scene);
  useCollapseOnLeave("avpc", () => { setAlignment(0); setOpen(false); });
  const focus = alignment < 34 ? 0 : alignment < 70 ? 1 : 2;
  const copy = getCollaboration(t)[focus];
  const shared = Math.min(1, alignment / 55);
  const conflict = Math.max(0, (alignment - 70) / 30);
  function move(_: unknown, info: PanInfo) { setAlignment(Math.max(0, Math.min(100, dragStart.current + info.offset.x / 3))); if (Math.abs(info.offset.x) > 12) setOpen(true); }
  return <section id="avpc" className={`chapter future-avpc${quiet ? " is-quiet" : ""}`} aria-labelledby="avpc-title">
    <div className="chapter-inner">
      <div className="fa-heading-row"><p className="chapter-kicker">{t("05 / 协同感知研究", "05 / COLLABORATIVE PERCEPTION")}</p><span>{t("2026 — 至今 · 团队研究", "2026 — present · team research")}</span></div>
      <div className="fa-introduction"><div><p className="fa-project-name">{t("多车观察 · 地图约束", "MULTI-VEHICLE VIEWS · MAP CONSTRAINTS")}</p><h2 id="avpc-title">AVPC</h2><p className="fa-project-question">{t("两辆车看见的局部，怎样形成共同的空间理解？", "How can two vehicles reconcile their partial views?")}</p></div><div><p className="fa-role">{t("研究参与者 · Gordon Owusu Boateng 团队", "RESEARCH PARTICIPANT · GORDON OWUSU BOATENG TEAM")}</p><p className="fa-intro-copy">{t("数据筛选、约束方案与仿真验证是我的参与范围。", "My work concerns data screening, constraint design discussions and simulation exploration.")}</p></div></div>
      <div ref={scene}><motion.div className="avpc-evidence-scene" initial={quiet ? false : { opacity: 0, y: 24 }} animate={{ opacity: quiet || scenePresent ? 1 : 0, y: quiet || scenePresent ? 0 : 24 }} transition={slowMotion({ duration: quiet ? 0 : .65, ease: [.22, 1, .36, 1] })} onPanStart={() => { dragStart.current = alignment; }} onPan={move} aria-label={t("左右拖动空间图，将车辆观察连接到共同地标，再查看冲突检验", "Drag the spatial diagram horizontally to connect vehicle observations to shared landmarks and inspect conflicts")}>
        <div className="avpc-scene-heading"><strong>{t("从局部视角，到共同地图", "From local views to a shared map")}</strong><span>{t("研究框架示意", "RESEARCH FRAMEWORK DIAGRAM")}</span></div>
        <svg className="avpc-map" viewBox="0 0 920 460" role="img" aria-labelledby="avpc-map-title"><title id="avpc-map-title">{t("两辆车通过共同地标关联观察，再识别空间冲突的研究示意", "Research diagram: two vehicles connect observations through shared landmarks, then identify spatial conflicts")}</title>
          <defs><pattern id="avpc-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#ebdce2" strokeWidth="1"/></pattern><marker id="avpc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10" fill="#6c183c"/></marker></defs>
          <rect x="20" y="30" width="880" height="400" rx="20" fill="#fff7e9"/><rect x="20" y="30" width="880" height="400" rx="20" fill="url(#avpc-grid)"/>
          <path d="M100 290H815M100 315H815" stroke="#dbc9c9" strokeWidth="2" strokeDasharray="12 8"/>
          {[150,270,390,510,630,750].map((x,i) => <g key={x}><path d={`M${x} 160V240H${x+84}V160`} fill="none" stroke="#b39aa4" strokeWidth="2"/><text x={x+24} y="207" fill="#6c183c" fontSize="18">P{i+14}</text></g>)}
          <path d="M220 325L370 170L680 230Z" fill="#315ede" opacity={.07+.10*(1-shared)}/><path d="M685 345L470 158L770 217Z" fill="#a35123" opacity={.07+.10*(1-shared)}/>
          <g transform={`translate(${(1-shared)*-28} 0)`}><path d="M225 315L555 162M225 315L720 220" stroke="#315ede" strokeWidth="3" strokeDasharray={shared>.9 ? undefined : "8 7"} opacity={.3+.6*shared}/></g>
          <g transform={`translate(${(1-shared)*30} 0)`}><path d="M680 332L555 162M680 332L720 220" stroke="#a35123" strokeWidth="3" strokeDasharray={shared>.9 ? undefined : "8 7"} opacity={.3+.6*shared}/></g>
          <g><rect x="188" y="302" width="80" height="43" rx="14" fill="#315ede"/><rect x="207" y="309" width="34" height="28" rx="4" fill="#cfddff"/><circle cx="254" cy="312" r="4" fill="#fff"/><circle cx="254" cy="335" r="4" fill="#fff"/><text x="190" y="379" fill="#2446a4" fontSize="19">{"A"}</text></g>
          <g><rect x="642" y="320" width="82" height="43" rx="14" fill="#a35123"/><rect x="665" y="327" width="34" height="28" rx="4" fill="#ffdab0"/><circle cx="649" cy="330" r="4" fill="#fff"/><circle cx="649" cy="352" r="4" fill="#fff"/><text x="606" y="405" fill="#843c17" fontSize="19">{"B"}</text></g>
          <g><circle cx="555" cy="162" r="12" fill="#6c183c"/><path d="M555 149V123H656" fill="none" stroke="#6c183c" strokeWidth="2"/><text x="594" y="107" fill="#6c183c" fontSize="20">{"P17"}</text><circle cx="555" cy="162" r={18+shared*12} fill="none" stroke="#6c183c" strokeWidth="2" opacity={shared}/></g>
          <g><rect x="704" y="204" width="32" height="24" rx="4" fill="#497b60"/><text x="751" y="222" fill="#326149" fontSize="18">{"A / B"}</text></g>
          <g opacity={conflict}><path d="M679 330L661 235" stroke="#c72f45" strokeWidth="3" strokeDasharray="6 5"/><circle cx="661" cy="235" r="17" fill="#ffedf0" stroke="#c72f45" strokeWidth="2"/><text x="657" y="242" fill="#c72f45" fontSize="21">!</text><path d="M661 247L570 265L510 265" fill="none" stroke="#c72f45" strokeWidth="2"/><text x="390" y="281" fill="#9e1731" fontSize="19">{t("冲突", "Conflict")}</text></g>
          <g opacity={shared}><path d="M360 72H504" stroke="#6c183c" strokeWidth="2" markerEnd="url(#avpc-arrow)"/><text x="90" y="79" fill="#6c183c" fontSize="19">{t("共同地图", "Shared map")}</text></g>
        </svg>
        <div className="avpc-map-legend"><span><i/>{t("A：车辆的 RGB 观察", "A: vehicle RGB observation")}</span><span><i/>{t("B：另一辆车的视角", "B: a second vehicle view")}</span><span><i/>{t("P17：共同地标", "P17: shared landmark")}</span></div>
        <div className="avpc-scene-stage"><span>0{focus+1}</span><strong>{[t("两组局部观察", "Separate local views"),t("关联共同地标", "Match shared landmarks"),t("冲突检查与再验证", "Check conflicts and re-evaluate")][focus]}</strong></div>
      </motion.div></div>
      <div className="fa-controls"><label htmlFor="avpc-alignment">{t("拖动图或滑条，查看视角如何关联", "Drag the diagram or slider to connect the views")}<MoveHorizontal size={18}/></label><input id="avpc-alignment" className="fa-range" type="range" min="0" max="100" value={alignment} aria-valuetext={copy.title} onChange={event => { setAlignment(Number(event.target.value)); setOpen(true); }}/><div className="fa-focus-buttons" role="group" aria-label={t("研究框架的三个阶段", "Three stages of the research framework")}>
        {[0,50,100].map((value,index) => <button key={value} aria-pressed={focus===index} onClick={() => { setAlignment(value); setOpen(true); }}>{[t("01 / 观察依据", "01 / Observations"),t("02 / 共同地标", "02 / Landmarks"),t("03 / 冲突检验", "03 / Conflict checks")][index]}</button>)}
      </div></div>
      <button className="future-reading-toggle fa-reading-toggle" aria-expanded={open} aria-controls="avpc-work-details" onClick={() => setOpen(!open)}>{open ? t("合上工作记录", "Close work notes") : t("阅读我的参与工作", "Read my contribution")}{open ? <Minus size={16}/> : <Plus size={16}/>}</button>
      <AnimatePresence initial={false}>{open && <ReadingReveal id="avpc-work-details" className="fa-work-reading" initial={{ gridTemplateRows: "0fr", opacity: 0 }} animate={{ gridTemplateRows: "1fr", opacity: 1 }} exit={{ gridTemplateRows: "0fr", opacity: 0 }} transition={slowMotion({ duration: quiet ? 0 : .32 })}><span className="fa-work-number">0{focus+1}</span><div><h3>{copy.title}</h3><p>{copy.text}</p><div className="fa-keywords">{copy.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></ReadingReveal>}</AnimatePresence>
      <div className="fa-current-boundary"><span>{t("当前阶段", "Current stage")}</span><p>{t("团队框架与仿真探索阶段。图示解释研究逻辑，不是实时协同推理或已验证定位结果。", "Team framework and simulation exploration. The diagram explains the research logic; it is not live collaborative inference or a validated localisation result.")}</p></div>
      <div className="fa-chapter-links"><a className="chapter-link" href="#sups">{t("查看仿真环境工作", "Explore the simulation work")}<ArrowUpRight size={18}/></a><a className="chapter-link" href="#mask">{t("进入应用工程：团队原型", "Applied engineering: a team prototype")}<ArrowDownRight size={18}/></a></div>
    </div>
  </section>;
}

export function FutureChapter({ quiet = false, part }: { quiet?: boolean; part: "perception" | "collaboration" }) {
  const reduced = quiet || Boolean(useReducedMotion());
  return part === "perception" ? <PerceptionResearch quiet={reduced}/> : <CollaborativeResearch quiet={reduced}/>;
}
