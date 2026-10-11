import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { ChevronLeft, ChevronRight, GripVertical, Minus, Plus, X } from "lucide-react";
import { useI18n } from "../i18n";
import { useScenePresence } from "../hooks/useScenePresence";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { slowMotion } from "../lib/motionTiming";
import { ReadingReveal } from "./ReadingReveal";
import "./professional-experience.css";

type Contribution = { label: string; title: string; text: string };

const gearPath = Array.from({ length: 64 }, (_, index) => {
  const angle = index * Math.PI / 32;
  const radius = index % 4 === 1 || index % 4 === 2 ? 36 : 29;
  return `${index === 0 ? "M" : "L"}${Math.cos(angle) * radius} ${Math.sin(angle) * radius}`;
}).join(" ") + " Z";

function MechanicalDrawing({ ready, reduced, active }: { ready: boolean; reduced: boolean; active: number | null }) {
  return <svg className="pe-machine-drawing" viewBox="0 0 440 170" aria-hidden="true">
    <path className="pe-machine-faint" d="M18 24H422M18 148H422M25 30V141M415 30V141" />
    <path className="pe-machine-shaft" d="M30 88H410" />
    {[85, 220, 355].map((position, index) => <g transform={`translate(${position} 88)`} key={position}>
      <motion.g className={`pe-machine-gear${active === index ? " is-engaged" : ""}`}
        initial={reduced ? false : { opacity: 0, rotate: -24 }}
        animate={{ opacity: ready ? 1 : 0, rotate: ready ? active === index ? 36 : 0 : -24 }}
        style={{ transformOrigin: "0px 0px" }}
        transition={slowMotion({ duration: reduced ? 0 : .5, delay: reduced || !ready ? 0 : index * .07 })}>
        <path d={gearPath} /><circle r="19" /><circle r="5" /><path d="M0-19V-8M19 0H8M0 19V8M-19 0H-8" />
      </motion.g>
      <motion.path className="pe-machine-connection" d="M0-36V-52H37" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: ready && active === index ? 1 : 0 }} transition={slowMotion({ duration: reduced ? 0 : .32 })} />
    </g>)}
    <path className="pe-machine-faint" d="M113 43H132V62H113ZM119 49H126M119 55H126M248 38L255 46L268 30M382 28V48M382 38H397V52" />
    {[ [16,14], [424,14], [16,156], [424,156] ].map(([x, y]) => <circle className="pe-machine-rivet" key={`${x}-${y}`} cx={x} cy={y} r="3" />)}
  </svg>;
}

function ContributionPanel({ id, labelledBy, contribution, reduced, close }: {
  id: string; labelledBy: string; contribution: Contribution; reduced: boolean; close: () => void;
}) {
  const { t } = useI18n();
  return <ReadingReveal id={id} role="region" aria-labelledby={labelledBy} className="pe-contribution"
    initial={reduced ? false : { gridTemplateRows: "0fr", opacity: 0 }} animate={{ gridTemplateRows: "1fr", opacity: 1 }} exit={{ gridTemplateRows: "0fr", opacity: 0 }}
    transition={slowMotion({ duration: reduced ? 0 : .3, ease: [.22, 1, .36, 1] })}>
    <div className="pe-contribution-top"><span>{t("我的工作", "My contribution")}</span><button type="button" className="pe-close" onClick={close} aria-label={t("收起这段贡献", "Close this contribution")}><X size={19} aria-hidden="true" /></button></div>
    <h4>{contribution.title}</h4><p>{contribution.text}</p>
  </ReadingReveal>;
}

function MechanicalSelector({ contributions, selected, open, reduced, select, toggle, trigger }: {
  contributions: Contribution[]; selected: number; open: boolean; reduced: boolean;
  select: (index: number, button: HTMLButtonElement | null) => void;
  toggle: (index: number, button: HTMLButtonElement) => void;
  trigger: RefObject<HTMLButtonElement | null>;
}) {
  const { t } = useI18n();
  const track = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const dragged = useRef(false);
  const position = useMotionValue(0);
  const [step, setStep] = useState(0);
  useLayoutEffect(() => {
    const lane = track.current;
    const tab = handle.current;
    if (!lane || !tab) return;
    const measure = () => {
      const width = lane.clientWidth;
      const tabWidth = tab.offsetWidth;
      const next = Math.max(0, width - tabWidth) / 2;
      setStep(previous => Math.abs(previous - next) < .5 ? previous : next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(lane); observer.observe(tab);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    position.stop();
    if (reduced) { position.set(selected * step); return; }
    const animation = animate(position, selected * step, slowMotion({ duration: .24, ease: [.22, 1, .36, 1] }));
    return () => animation.stop();
  }, [position, selected, step, reduced]);
  return <div className="pe-machine-controls">
    <div className="pe-machine-stations" role="group" aria-label={t("选择一项实习职责", "Choose an internship responsibility")}>
      {contributions.map((contribution, index) => <button id={`pe-kaiding-choice-${index}`} type="button" key={index} className={`pe-duty${open && selected === index ? " is-selected" : ""}`} aria-expanded={open && selected === index} aria-controls="pe-kaiding-contribution" onClick={event => toggle(index, event.currentTarget)}>
        <span className="pe-duty-number">0{index + 1}</span><strong>{contribution.label}</strong>{open && selected === index ? <Minus size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
      </button>)}
    </div>
    <div className="pe-shift-track" ref={track}>
      <div className="pe-shift-rail" aria-hidden="true"><i /><i /><i /></div>
      <motion.button type="button" className="pe-shift-handle" ref={handle} style={{ x: position }} drag="x" dragConstraints={track} dragElastic={0} dragMomentum={false}
        aria-label={t("横拖选择职责，点击展开当前职责", "Drag horizontally to select a responsibility; click to open it")}
        aria-describedby="pe-kaiding-instruction" aria-expanded={open} aria-controls="pe-kaiding-contribution"
        onPointerDown={() => { dragged.current = false; }}
        onDragStart={() => { dragged.current = true; position.stop(); trigger.current = handle.current; }}
        onDragEnd={() => {
          const next = step > 0 ? Math.max(0, Math.min(2, Math.round(position.get() / step))) : selected;
          select(next, handle.current);
          position.stop();
          if (reduced) position.set(next * step);
          else animate(position, next * step, slowMotion({ duration: .24, ease: [.22, 1, .36, 1] }));
        }}
        onClick={event => { if (!dragged.current) toggle(selected, event.currentTarget); }}
        onKeyDown={event => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : Math.max(0, Math.min(2, selected + (event.key === "ArrowLeft" ? -1 : 1)));
            select(next, event.currentTarget);
          }
          if (event.key === "Enter" || event.key === " ") dragged.current = false;
        }}><ChevronLeft size={14} aria-hidden="true" /><GripVertical size={19} aria-hidden="true" /><ChevronRight size={14} aria-hidden="true" /></motion.button>
    </div>
    <p id="pe-kaiding-instruction" className="pe-instruction">{t("点选职责，或横拖档片。", "Choose a responsibility or drag the selector.")}</p>
  </div>;
}

function KaidingExperience({ reduced }: { reduced: boolean }) {
  const { t } = useI18n();
  const scene = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const present = useScenePresence(scene);
  const ready = reduced || present;
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  useCollapseOnLeave("origins", () => setOpen(false));
  const contributions: Contribution[] = [
    { label: t("开发联调", "Build & integrate"), title: t("生产管理软件的开发与联调", "Production software development and integration"), text: t("参与汽车零部件生产管理系统的功能开发、前后端联调及数据库核查。", "Contributed to feature development, frontend–backend integration and database checks for an automotive-parts production-management system.") },
    { label: t("测试支持", "Test & support"), title: t("测试验证与日常 IT 支持", "Testing and day-to-day IT support"), text: t("参与功能测试、界面验证与问题反馈，并协助系统配置、故障排查和日常技术支持。", "Contributed to functional testing, interface checks and issue reporting, and assisted with system configuration, troubleshooting and day-to-day technical support.") },
    { label: t("协作工具", "Team tools"), title: t("代码协作、记录与办公工具", "Code collaboration, records and office tools"), text: t("使用 Git 与任务管理系统参与代码提交、版本维护和技术文档整理；参与企业 AI 办公工具推广。", "Used Git and task-management tools for code contributions, version maintenance and technical documentation, and helped introduce AI office tools.") },
  ];
  const select = (index: number, button: HTMLButtonElement | null) => { trigger.current = button; setSelected(index); setOpen(true); };
  const toggle = (index: number, button: HTMLButtonElement) => { trigger.current = button; setOpen(previous => selected === index ? !previous : true); setSelected(index); };
  const close = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }); };
  return <article ref={scene} className="pe-record pe-kaiding" aria-labelledby="pe-kaiding-title" onKeyDown={event => {
    if (event.key === "Escape" && open) { event.preventDefault(); close(); }
  }}>
    <header className="pe-record-heading"><span className="pe-record-kicker">{t("01 / 企业实习", "01 / INDUSTRY INTERNSHIP")}</span><h3 id="pe-kaiding-title">{t("十堰凯鼎动力科技有限公司", "Shiyan Kaiding Power Technology Co., Ltd.")}</h3><div className="pe-record-meta"><span>{t("2024 年夏", "Summer 2024")}</span><span>{t("信息部门 · IT 实习生", "Information Department · IT intern")}</span></div></header>
    <p className="pe-summary">{t("参与汽车零部件生产管理软件的开发、联调与测试。", "Contributed to the development, integration and testing of automotive-parts production-management software.")}</p>
    <div className="pe-machine-console"><MechanicalDrawing ready={ready} reduced={reduced} active={open ? selected : null} /><MechanicalSelector contributions={contributions} selected={selected} open={open} reduced={reduced} select={select} toggle={toggle} trigger={trigger} /></div>
    <AnimatePresence initial={false}>{open && <ContributionPanel id="pe-kaiding-contribution" labelledBy={`pe-kaiding-choice-${selected}`} contribution={contributions[selected]} reduced={reduced} close={close} />}</AnimatePresence>
  </article>;
}

function AcquisitionDrawing({ ready, reduced, active }: { ready: boolean; reduced: boolean; active: number | null }) {
  const connections = ["M107 90Q140 86 153 126L168 155", "M168 155Q216 109 263 155", "M303 153L332 129Q347 109 358 89"];
  return <svg className="pe-acquisition-drawing" viewBox="0 0 440 220" aria-hidden="true">
    <path className="pe-paper-guide" d="M15 177H425M15 200H425M15 153H425M15 130H425" />
    <motion.g initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 8 }} transition={slowMotion({ duration: reduced ? 0 : .45 })}>
      <path className={`pe-drawn-device${active === 0 ? " is-focused" : ""}`} d="M34 37Q69 32 105 38L108 111Q69 118 31 111ZM45 52L93 51L94 86L44 87ZM55 104L86 104M69 38V24Q53 9 39 24" />
      <circle className="pe-drawn-device" cx="38" cy="24" r="7" /><circle className="pe-drawn-device" cx="54" cy="100" r="3" />
      <path className={`pe-drawn-notes${active === 2 ? " is-focused" : ""}`} d="M344 28L402 34L398 118L339 112ZM354 51L359 57L369 45M354 78L359 84L369 72M375 51L391 52M375 79L390 80M349 101L387 102" />
      <path className="pe-sensor-lead" d="M87 111Q102 142 126 135M62 112Q49 138 32 135" />
    </motion.g>
    <motion.path className={`pe-drawn-wave${active === 1 ? " is-focused" : ""}`} d="M15 178Q31 175 42 178L50 163L62 191L74 137L86 204L97 169L106 178Q126 175 149 178L157 161L168 190L180 145L193 198L204 169L217 178Q244 176 265 178L276 165L287 189L298 140L311 199L323 172L333 178Q372 175 425 178" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: ready ? 1 : 0 }} transition={slowMotion({ duration: reduced ? 0 : .8, delay: reduced || !ready ? 0 : .16 })} />
    {connections.map((connection, index) => <motion.path key={connection} className="pe-acquisition-connection" d={connection} initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: ready && active === index ? 1 : 0, opacity: ready && active === index ? 1 : 0 }} transition={slowMotion({ duration: reduced ? 0 : .45 })} />)}
    <path className="pe-drawn-arrow" d="M160 153L168 155L168 145M255 154L263 155L261 146M350 91L358 89L356 99" />
  </svg>;
}

function SurfExperience({ reduced }: { reduced: boolean }) {
  const { t } = useI18n();
  const scene = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const present = useScenePresence(scene);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  useCollapseOnLeave("origins", () => setOpen(false));
  const contributions: Contribution[] = [
    { label: t("准备校准", "Prepare & calibrate"), title: t("采集前的设备准备", "Device preparation before acquisition"), text: t("参与 Shimmer3 IMU / ExG 设备准备与校准，检查硬件连接及设备运行状态。", "Helped prepare and calibrate Shimmer3 IMU / ExG devices, checking hardware connections and device operation.") },
    { label: t("采集检查", "Check acquisition"), title: t("采集过程中的实时检查", "Checks during data acquisition"), text: t("参与运动与电生理信号采集，在采集过程中检查数据并排查连接、运行与采集异常。", "Contributed to motion and electrophysiological data acquisition, checking data during recording and investigating connection, device and acquisition issues.") },
    { label: t("质量记录", "Quality records"), title: t("为后续研究保留原始数据", "Original data for subsequent research"), text: t("对采集结果进行质量检查，为团队后续信号处理与监测研究提供可靠的原始数据。", "Checked acquisition quality and provided reliable original data for the team’s subsequent signal-processing and monitoring research.") },
  ];
  const close = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }); };
  return <article ref={scene} className="pe-record pe-surf" aria-labelledby="pe-surf-title" onKeyDown={event => {
    if (event.key === "Escape" && open) { event.preventDefault(); close(); }
  }}>
    <header className="pe-record-heading"><span className="pe-record-kicker">{t("02 / SURF 本科研究", "02 / SURF UNDERGRADUATE RESEARCH")}</span><h3 id="pe-surf-title">{t("帕金森监测研究中的可穿戴数据采集", "Wearable Data Collection for Parkinson’s Monitoring Research")}</h3><div className="pe-record-meta"><span>2025.06–09</span><span>{t("西交利物浦大学", "Xi’an Jiaotong-Liverpool University")}</span><span>{t("研究参与者 · 采集与质量保证", "Research participant · acquisition and quality assurance")}</span></div></header>
    <p className="pe-summary">{t("参与运动与电生理数据采集，检查设备运行与信号质量，为后续研究提供原始数据。", "Contributed to motion and electrophysiological data acquisition, checking devices and signal quality to provide original data for subsequent research.")}</p>
    <figure className="pe-acquisition-scene"><AcquisitionDrawing ready={reduced || present} reduced={reduced} active={open ? selected : null} /><figcaption>{t("Shimmer3 IMU / ExG · 采集流程示意", "Shimmer3 IMU / ExG · acquisition workflow illustration")}</figcaption></figure>
    <div className="pe-acquisition-nodes" role="group" aria-label={t("查看采集流程中的个人工作", "Explore my work in the acquisition workflow")}>
      {contributions.map((contribution, index) => <button type="button" id={`pe-surf-choice-${index}`} className={`pe-acquisition-node${open && selected === index ? " is-selected" : ""}`} key={index} aria-expanded={open && selected === index} aria-controls="pe-surf-contribution" onClick={event => { trigger.current = event.currentTarget; setOpen(previous => selected === index ? !previous : true); setSelected(index); }}>
        <span className="pe-node-mark">0{index + 1}</span><strong>{contribution.label}</strong>{open && selected === index ? <Minus size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
      </button>)}
    </div>
    <AnimatePresence initial={false}>{open && <ContributionPanel id="pe-surf-contribution" labelledBy={`pe-surf-choice-${selected}`} contribution={contributions[selected]} reduced={reduced} close={close} />}</AnimatePresence>
  </article>;
}

export function ProfessionalExperience({ quiet }: { quiet: boolean }) {
  const { t } = useI18n();
  const [systemReduced, setSystemReduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const reduced = quiet || systemReduced;
  return <section id="origins" className={`chapter professional-experience pe-chapter${reduced ? " is-quiet" : ""}`} aria-labelledby="experience-title">
    <div className="chapter-inner pe-inner"><header className="pe-heading"><p className="pe-kicker">{t("09 / 实习与研究经历", "09 / PROFESSIONAL & RESEARCH EXPERIENCE")}</p><h2 id="experience-title" className="project-title">{t("实习与研究经历", "Professional & research experience")}</h2><p>{t("企业软件参与，与研究数据采集。", "Enterprise software and research data acquisition.")}</p></header>
      <div className="pe-records"><KaidingExperience reduced={reduced} /><SurfExperience reduced={reduced} /></div>
    </div>
  </section>;
}
