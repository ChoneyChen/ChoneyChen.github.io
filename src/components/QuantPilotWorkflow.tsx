import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useI18n } from "../i18n";
import { useScenePresence } from "../hooks/useScenePresence";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { ReadingReveal } from "./ReadingReveal";
import "./quantpilot-workflow.css";

export function QuantPilotWorkflow({ quiet }: { quiet: boolean }) {
  const { t } = useI18n();
  const reduced = quiet || Boolean(useReducedMotion());
  const surface = useRef<HTMLDivElement>(null);
  const present = useScenePresence(surface);
  const ready = reduced || present;
  const [active, setActive] = useState<number | null>(null);
  useCollapseOnLeave("tools", () => setActive(null));
  const labels = [t("确定性因子", "Deterministic factors"), t("Qwen 人工复核", "Manual Qwen review"), t("会话研究记忆", "Session memory")];
  const notes = [
    t("先从确定性计算建立研究输入，让因子与模型解释有清楚边界。", "Deterministic calculations establish research inputs, keeping computed factors distinct from model interpretations."),
    t("Qwen 提供辅助分析，再由人复核依据与结论；不把模型回答当成已验证收益。", "Qwen assists analysis; human review checks evidence and conclusions. Model responses are not validated investment returns."),
    t("保存当前会话的研究上下文，使后续讨论能够接续已有记录。", "Retain the session’s research context so later discussion can build on the existing record."),
  ];
  const select = (index: number) => setActive(current => current === index ? null : index);
  return <div className="qp-workflow" ref={surface} data-entry-state={ready ? "present" : "reset"}>
    <div className="qp-workbench" aria-label={t("QuantPilot：点击因子、按下复核印章或拉开会话档案", "QuantPilot: select factors, press the review stamp, or pull out the session file")}>
      <motion.button className="qp-factor" aria-expanded={active === 0} aria-controls="qp-stage-details" onClick={() => select(0)} animate={{ y: ready ? 0 : 22, opacity: ready ? 1 : 0 }} transition={slowMotion({duration: reduced ? 0 : .65})}>
        <svg viewBox="0 0 150 150" aria-hidden="true"><path d="M15 14H126L137 25V136H15Z" fill="#e8ead1" stroke="#b4c8b0" strokeWidth="2"/><path d="M126 14V25H137" fill="none" stroke="#3f6357" strokeWidth="2"/>{Array.from({length:9},(_,i) => <motion.rect key={i} x={29+(i%3)*29} y={43+Math.floor(i/3)*25} width="20" height="16" rx="2" fill={i%3 === 1 ? "#4d7669" : "#b8c5a2"} animate={{ opacity: active === 0 ? 1 : .5, scale: active === 0 ? 1 : .85 }} transition={slowMotion({duration: reduced ? 0 : .35, delay: reduced ? 0 : i*.035})}/>)}<path d="M28 118H114" stroke="#3f6357" strokeWidth="3"/></svg>
        <span>01</span><strong>{labels[0]}</strong>
      </motion.button>
      <motion.button className="qp-review" aria-expanded={active === 1} aria-controls="qp-stage-details" drag={reduced ? false : "y"} dragConstraints={{top:0,bottom:32}} dragSnapToOrigin dragTransition={slowDragRelease} onDragEnd={(_,info) => {if(info.offset.y > 12)setActive(1);}} onClick={() => select(1)} animate={{ y: ready ? 0 : -24, opacity: ready ? 1 : 0 }} transition={slowMotion({duration: reduced ? 0 : .7, delay: reduced || !ready ? 0 : .12})}>
        <svg viewBox="0 0 150 150" aria-hidden="true"><path d="M14 71H136V137H14Z" fill="#e8ead1" stroke="#b4c8b0" strokeWidth="2"/><motion.g animate={{y:active === 1 ? 19 : 0}} transition={slowMotion({duration:reduced ? 0 : .4})}><path d="M61 22Q75 10 89 22L85 48H103V64H47V48H65Z" fill="#d5ac66" stroke="#f6dfaa" strokeWidth="2"/><path d="M45 65H105V77H45Z" fill="#b87b47" stroke="#f6dfaa" strokeWidth="2"/></motion.g><motion.g animate={{opacity: active === 1 ? 1 : .15, scale:active === 1 ? 1 : .8}} transition={slowMotion({duration:reduced ? 0 : .3, delay:reduced ? 0 : .15})}><rect x="45" y="100" width="60" height="21" rx="3" fill="none" stroke="#aa5a35" strokeWidth="2"/><path d="M63 110L71 116L87 102" stroke="#aa5a35" strokeWidth="3" fill="none"/></motion.g></svg>
        <span>02</span><strong>{labels[1]}</strong>
      </motion.button>
      <motion.button className="qp-memory" aria-expanded={active === 2} aria-controls="qp-stage-details" drag={reduced ? false : "x"} dragConstraints={{left:0,right:28}} dragSnapToOrigin dragTransition={slowDragRelease} onDragEnd={(_,info) => {if(info.offset.x > 12)setActive(2);}} onClick={() => select(2)} animate={{ x: ready ? 0 : 24, opacity: ready ? 1 : 0 }} transition={slowMotion({duration: reduced ? 0 : .7, delay: reduced || !ready ? 0 : .24})}>
        <svg viewBox="0 0 150 150" aria-hidden="true"><path d="M13 51H48L60 62H137V135H13Z" fill="#527969" stroke="#b9ccb6" strokeWidth="2"/><motion.g animate={{y:active === 2 ? -15 : 0, rotate:active === 2 ? -5 : 0}} transition={slowMotion({duration:reduced ? 0 : .6})}><rect x="32" y="46" width="82" height="75" rx="2" fill="#e8ead1"/><path d="M45 61H100M45 74H94M45 87H97" stroke="#597263" strokeWidth="3"/></motion.g><motion.path d="M14 79H137L124 137H22Z" fill="#8da28a" stroke="#c7d4bb" strokeWidth="2" animate={{y:active === 2 ? 5 : 0}} transition={slowMotion({duration:reduced ? 0 : .6})}/></svg>
        <span>03</span><strong>{labels[2]}</strong>
      </motion.button>
    </div>
    <p className="qp-hint">{t("点选因子 · 下压印章 · 右拉档案", "Select factors · press the stamp · pull the file")}</p>
    <AnimatePresence initial={false}>{active !== null && <ReadingReveal id="qp-stage-details" className="qp-stage-details" initial={{gridTemplateRows:"0fr",opacity:0}} animate={{gridTemplateRows:"1fr",opacity:1}} exit={{gridTemplateRows:"0fr",opacity:0}} transition={slowMotion({duration:reduced ? 0 : .35})}><div><strong>{labels[active]}</strong><button aria-label={t("合上流程记录", "Close workflow notes")} onClick={() => setActive(null)}><X size={17}/></button><p>{notes[active]}</p></div></ReadingReveal>}</AnimatePresence>
  </div>;
}
