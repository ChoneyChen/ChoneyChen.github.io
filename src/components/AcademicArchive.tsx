import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion } from "motion/react";
import { Minus } from "lucide-react";
import { useScenePresence } from "../hooks/useScenePresence";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useContent } from "../data/use-content";
import { useI18n } from "../i18n";
import { slowMotion } from "../lib/motionTiming";
import { ReadingReveal } from "./ReadingReveal";
import "./academic-archive.css";

const getTechnicalGroups = (t: (zh: string, en: string) => string) => [
  {
    id: "programming",
    title: t("编程与数据", "Programming & data"),
    preview: "Python / MATLAB / Git",
    items: ["Python", "MATLAB", "Git", t("回归与统计建模", "Regression & statistical modelling")],
    record: t("数据建模 · 凯鼎动力 IT 实习", "Data modelling · Kaiding Power IT internship"),
    application: t("用 Python 清洗数据与回归建模，用 MATLAB 做数值和信号实验，用 Git 管理协作版本。", "Used Python for data cleaning and regression, MATLAB for numerical and signal experiments, and Git for collaborative version management."),
  },
  {
    id: "vision",
    title: t("视觉模型与训练", "Vision models & training"),
    preview: "Qwen / LoRA",
    items: [t("Qwen 系列训练", "Qwen training"), t("LoRA 微调", "LoRA fine-tuning"), t("训练配置", "Training configuration"), t("控制变量实验", "Controlled experiments")],
    record: "Cosmos-Loc",
    application: t("参与 Qwen 训练配置、运行监控与 LoRA 实验迭代，比较不同训练条件。", "Contributed to Qwen training configuration, run monitoring and LoRA iteration, comparing training conditions."),
  },
  {
    id: "systems",
    title: t("软件与嵌入式", "Software & embedded systems"),
    preview: "FastAPI / Raspberry Pi",
    items: ["FastAPI", "SQLite", "Raspberry Pi", "ESP32-S3"],
    record: t("智能光疗面罩系统", "Phototherapy mask system"),
    application: t("参与本地软件接口、设备通信、控制逻辑与系统联调。", "Contributed to local software interfaces, device communication, control logic and system integration."),
  },
  {
    id: "documents",
    title: t("文档 AI 整合", "Document AI integration"),
    preview: "NuExtract3 / PaddleOCR-VL",
    items: ["NuExtract3", "PaddleOCR-VL", "Qwen3-Embedding", t("指标标准化与证据关联", "Normalisation & evidence linking")],
    record: t("ESG AI 实习", "ESG AI internship"),
    application: t("参与文档模型整合、指标标准化与来源证据关联。", "Contributed to document-model integration, indicator normalisation and source-evidence linking."),
  },
];

type TechnicalGroup = ReturnType<typeof getTechnicalGroups>[number];

function TechnologyPillar({ group, index, selected, ready, reduced, onSelect, onToggle }: {
  group: TechnicalGroup;
  index: number;
  selected: boolean;
  ready: boolean;
  reduced: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const { t } = useI18n();
  const pull = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const startSelected = useRef(false);
  const returning = useRef<ReturnType<typeof animate> | null>(null);
  useEffect(() => {
    if (!ready || reduced) {
      returning.current?.stop();
      pull.set(0);
      setDragging(false);
    }
    return () => returning.current?.stop();
  }, [ready, reduced, pull]);
  const timing = (duration: number, delay = 0) => slowMotion({
    duration: reduced ? 0 : duration,
    delay: reduced ? 0 : delay,
    ease: [.22, 1, .36, 1] as const,
  });
  return <article className={"aa-pillar aa-pillar-" + group.id + (selected ? " is-selected" : "")}>
    <h4 id={"aa-group-" + group.id}>{group.title}</h4>
    <div className="aa-pillar-illustration">
      <svg className="aa-pillar-shaft" viewBox="0 0 160 240" aria-hidden="true">
        <motion.g initial={false} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 25 }} transition={timing(.35, ready ? index * .04 : .16)}>
          <path d="M30 216H130V226H30Z M20 227H140V235H20Z" fill="#dac4a0" stroke="#947254"/>
          <path d="M45 204H115V215H45Z" fill="#eee0c1" stroke="#947254"/>
        </motion.g>
        {[0, 1, 2].map(drum => <motion.g key={drum} initial={false}
          animate={{ opacity: ready ? 1 : 0, y: ready ? selected ? -(2 - drum) * 7 : 0 : 26 }}
          transition={timing(.4, ready ? .07 + (2 - drum) * .07 + index * .04 : drum * .06)}>
          <path d={"M" + (50 - drum) + " " + (69 + drum * 45) + "H" + (110 + drum) + "L" + (108 + drum) + " " + (111 + drum * 45) + "H" + (52 - drum) + "Z"} fill={selected ? "#f8efd9" : "#ece0c5"} stroke="#947254"/>
          {[0, 1, 2, 3, 4].map(flute => <path key={flute} d={"M" + (58 + flute * 11) + " " + (74 + drum * 45) + "V" + (106 + drum * 45)} stroke="#b29972" fill="none"/>)}
          <path d={"M" + (50 - drum) + " " + (111 + drum * 45) + "H" + (110 + drum)} stroke="#947254"/>
        </motion.g>)}
      </svg>
      <motion.div className="aa-capital-position" initial={false} animate={{ opacity: ready ? 1 : 0, y: ready ? selected && (!dragging || startSelected.current) ? -20 : 0 : 23 }}
        transition={timing(.4, ready ? .28 + index * .04 : 0)}>
        <motion.button type="button" className="aa-capital-control" style={{ y: pull }}
          drag="y" dragConstraints={{ top: -42, bottom: 0 }} dragElastic={.05} dragMomentum={false}
          onDragStart={() => { returning.current?.stop(); startSelected.current = selected; setDragging(true); }}
          onDrag={(_, info) => { if (info.offset.y < -22) onSelect(); }}
          onDragEnd={(_, info) => {
            if (info.offset.y < -16) onSelect();
            setDragging(false);
            returning.current = animate(pull, 0, timing(.36));
          }}
          onClick={event => { if (event.detail === 0 || Math.abs(pull.get()) < 5) onToggle(); }}
          aria-expanded={selected} aria-controls="aa-project-mapping"
          aria-label={t("拉开或点击柱头，查看" + group.title + "的技术实践", "Pull or click the capital to view " + group.title + " in practice")}>
          <svg viewBox="0 0 160 80" aria-hidden="true">
            <path d="M25 19H135V29H25Z M43 60H117V69H43Z" fill="#d8c09b" stroke="#947254"/>
            <path d="M34 34C26 21 49 25 54 40C57 55 43 58 37 49C32 39 46 31 49 42M126 34C134 21 111 25 106 40C103 55 117 58 123 49C128 39 114 31 111 42" fill="none" stroke="#947254" strokeWidth="2"/>
            <path d="M51 41L61 52L70 37L80 55L90 37L99 52L109 41L105 60H55Z" fill={selected ? "#b48755" : "#e4cfab"} stroke="#947254"/>
            <path d="M70 13L80 7L90 13" fill="none" stroke="#795344" strokeWidth="2"/>
          </svg>
        </motion.button>
      </motion.div>
    </div>
    <p className="aa-pillar-preview">{group.preview}</p>
  </article>;
}

export function PersonalArchive({ quiet = false }: { quiet?: boolean }) {
  const { t } = useI18n();
  const { profile } = useContent();
  const groups = getTechnicalGroups(t);
  const [selected, setSelected] = useState<number | null>(null);
  const systemReduced = useReducedMotion();
  const reduced = quiet || Boolean(systemReduced);
  const scene = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const present = useScenePresence(scene);
  const ready = reduced || present;
  useCollapseOnLeave("archive", () => setSelected(null));
  useEffect(() => { if (!present) setSelected(null); }, [present]);
  const focusCapital = () => {
    if (selected !== null) scene.current?.querySelector<HTMLButtonElement>(".aa-pillar-" + groups[selected].id + " button")?.focus({ preventScroll: true });
  };
  const active = selected === null ? null : groups[selected];
  return <section id="archive" className={"chapter academic-archive" + (reduced ? " is-quiet" : "")} aria-labelledby="archive-title" onKeyDown={event => {
    if (event.key === "Escape" && selected !== null) { event.preventDefault(); focusCapital(); setSelected(null); }
  }}>
    <div className="chapter-inner">
      <header className="aa-heading"><p className="chapter-kicker">{t("10 / 教育与技术基础", "10 / EDUCATION & TECHNICAL FOUNDATION")}</p><h2 id="archive-title" className="project-title">{t("教育与技术基础", "Education & technical foundation")}</h2></header>
      <article className="aa-degree" aria-labelledby="aa-school">
        <div className="aa-degree-copy">
          <p className="aa-degree-type">{t("工学学士", "Bachelor of Engineering")} <span>{profile.education.degree}</span></p>
          <h3 id="aa-school">{profile.education.university}</h3>
          <p className="aa-programme">{t("计算机科学与技术", "Computer Science and Technology")}</p>
        </div>
        <dl className="aa-study-details">
          <div><dt>{t("学习时间", "Study period")}</dt><dd>2023.09 — 2027.06 <span>{t("预计毕业", "Expected graduation")}</span></dd></div>
          <div><dt>{t("当前阶段", "Current stage")}</dt><dd>Stage 4 <span>{t("本科最后一年 · 在读", "Final-year undergraduate · enrolled")}</span></dd></div>
        </dl>
      </article>
      <div className="aa-stack-heading"><h3>{t("技术基础", "Technical foundation")}</h3><p>{t("上拉或点击柱头，展开对应技术与实践。", "Pull up or click a capital to reveal the skills and their use.")}</p></div>
      <div className="aa-pillar-stage" ref={scene}>
        {groups.map((group, index) => <TechnologyPillar key={group.id} group={group} index={index} ready={ready} reduced={reduced} selected={selected === index} onSelect={() => setSelected(index)} onToggle={() => setSelected(current => current === index ? null : index)}/>)}
      </div>
      <AnimatePresence initial={false}>{active && <ReadingReveal id="aa-project-mapping" role="region" aria-labelledby={"aa-group-" + active.id} className={"aa-project-mapping aa-mapping-" + active.id}
        initial={reduced ? false : { gridTemplateRows: "0fr", opacity: 0 }} animate={{ gridTemplateRows: "1fr", opacity: 1 }} exit={{ gridTemplateRows: "0fr", opacity: 0 }}
        transition={slowMotion({ duration: reduced ? 0 : .34, ease: [.22, 1, .36, 1] })}>
        <div className="aa-mapping-heading"><h4>{active.title}</h4><button ref={closeButton} type="button" onClick={() => { focusCapital(); setSelected(null); }} aria-label={t("收起技术实践", "Close technical practice")}><Minus size={20}/>{t("收起", "Close")}</button></div>
        <div className="aa-mapping-content">
          <ul>{active.items.map(item => <li key={item}>{item}</li>)}</ul>
          <div><p className="aa-mapping-record">{active.record}</p><p>{active.application}</p></div>
        </div>
      </ReadingReveal>}</AnimatePresence>
      <dl className="aa-supplementary">
        <div><dt>{t("仿真", "Simulation")}</dt><dd>{t("SUPS / SVL 场景扩展。", "SUPS / SVL scene extensions.")}</dd></div>
        <div><dt>{t("信号处理", "Signal processing")}</dt><dd>{t("Shimmer3 IMU / ExG 采集；MATLAB CSP、EEGLAB / BioSig。", "Shimmer3 IMU / ExG acquisition; MATLAB CSP, EEGLAB / BioSig.")}</dd></div>
      </dl>
    </div>
  </section>;
}
