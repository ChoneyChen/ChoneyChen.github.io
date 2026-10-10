import { useScenePresence } from "../hooks/useScenePresence";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Minus, Plus } from "lucide-react";
import { useContent } from "../data/use-content";
import { useI18n } from "../i18n";
import { canonicalIndex, learningIds } from "../data/architecture";
import { slowMotion } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { ReadingReveal } from "./ReadingReveal";
import { RomanEducation } from "./HistoryDetails";
import { LearningDetails } from "./LearningDetails";

export function PersonalArchive({ quiet }: { quiet: boolean }) {
  const { t } = useI18n();
  const { experienceTimeline } = useContent();
  const [open, setOpen] = useState("");
  useCollapseOnLeave("archive", () => setOpen(""));
  const scene = useRef<HTMLDivElement>(null);
  const present = useScenePresence(scene);
  const items = learningIds.map(id => experienceTimeline.find(item => item.id === id)!);
  return <section id="archive" className="chapter archive-chapter" aria-labelledby="archive-title">
    <div className="chapter-inner">
      <div className="archive-heading">
        <div><p className="chapter-kicker">{t("10 / 学习与经历索引", "10 / EDUCATION & EXPERIENCE INDEX")}</p><h2 id="archive-title">{t("我的学习，", "The foundations,")}<br/>{t("和它的记录。", "and the records.")}</h2></div>
        <div className="archive-note"><span className="archive-count">{items.length}<span>{t("学习档案", "ACADEMIC FILES")}</span></span><p>{t("教育、团队课程与人工智能实验。", "Education, team coursework and AI experiments.")}</p></div>
      </div>
      <div className="archive-records" ref={scene}>
        {items.map((item, index) => <motion.article key={item.id} className={`archive-ticket ${open === item.id ? "is-open" : ""}`} initial={quiet ? false : { opacity: 0, x: index % 2 ? 28 : -28 }} animate={{ opacity: quiet || present ? 1 : 0, x: quiet || present ? 0 : index % 2 ? 28 : -28 }} transition={slowMotion({ duration: quiet ? 0 : .55, ease: [.16, 1, .3, 1] })}>
          <button className="archive-ticket-button" aria-expanded={open === item.id} aria-controls={`record-${item.id}`} onClick={() => setOpen(open === item.id ? "" : item.id)}>
            <span className="archive-year">{item.id === "can201" ? "2025" : item.year}</span><span className="archive-title">{item.title}<small>{item.role}</small></span><span className="archive-status">{item.status}</span>{open === item.id ? <Minus size={19}/> : <Plus size={19}/>}
          </button>
          <AnimatePresence initial={false}>{open === item.id && <ReadingReveal id={`record-${item.id}`} className="archive-ticket-body" initial={{ gridTemplateRows: "0fr", opacity: 0 }} animate={{ gridTemplateRows: "1fr", opacity: 1 }} exit={{ gridTemplateRows: "0fr", opacity: 0 }} transition={slowMotion({ duration: quiet ? 0 : .28 })}>
            <div className={item.id === "education" ? "archive-education-body" : undefined}>{item.id === "education" ? <RomanEducation quiet={quiet}/> : <LearningDetails course={item.id as "can201" | "isa305"}/>}</div>
          </ReadingReveal>}</AnimatePresence>
        </motion.article>)}
      </div>
      <div className="experience-cross-index">
        <div className="experience-index-heading"><h3>{t("其他经历，按条目找到。", "Find the rest of my work.")}</h3><span>{canonicalIndex.length} {t("个入口", "ENTRIES")}</span></div>
        <nav aria-label={t("项目与早期经历索引", "Projects and early-experience index")}>
          {canonicalIndex.map((entry, index) => <a key={entry.record} href={`#${entry.owner}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{t(entry.label[0], entry.label[1])}</strong><ArrowUpRight size={16}/></a>)}
        </nav>
      </div>
      <a className="chapter-link" href="#methods">{t("接下来：我的工作方法", "Next: my working practices")}<ArrowRight size={18}/></a>
    </div>
  </section>;
}
