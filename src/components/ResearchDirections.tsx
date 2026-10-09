import { ReadingReveal } from "./ReadingReveal";
import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowDownRight, ArrowRight, ArrowUp, ArrowUpRight, Minus, Plus } from 'lucide-react'
import { useI18n } from '../i18n'
import './research-directions.css'

interface ResearchDirectionsProps { quiet?: boolean }

export function ResearchDirections({ quiet = false }: ResearchDirectionsProps) {
  const { t } = useI18n()
  const systemQuiet = useReducedMotion()
  const reduced = quiet || Boolean(systemQuiet)
  const [agentsOpen, setAgentsOpen] = useState(false)
  const [spatialOpen, setSpatialOpen] = useState(false)
  const [environmentOpen, setEnvironmentOpen] = useState(false)
  useCollapseOnLeave("directions", () => { setAgentsOpen(false); setSpatialOpen(false); setEnvironmentOpen(false); });
  const agentRef = useRef<HTMLDivElement>(null)
  const spatialRef = useRef<HTMLDivElement>(null)
  const environmentRef = useRef<HTMLDivElement>(null)
  const agentInView = useInView(agentRef, { once: false, amount: .2 })
  const spatialInView = useInView(spatialRef, { once: false, amount: .2 })
  const environmentInView = useInView(environmentRef, { once: false, amount: .2 })
  const agentReady = reduced || agentInView
  const spatialReady = reduced || spatialInView
  const environmentReady = reduced || environmentInView
  const arrival = reduced ? { duration: 0 } : { duration: .58, ease: [.22, 1, .36, 1] as const }
  const reading = reduced ? { duration: 0 } : { duration: .22, ease: [.22, 1, .36, 1] as const }
  const expansion = reduced ? { duration: 0 } : { duration: .4, ease: [.22, 1, .36, 1] as const }

  return <section id="directions" className={`chapter research-directions${reduced ? ' is-quiet' : ''}`} aria-labelledby="directions-title">
    <div className="chapter-inner">
      <div className="rd-heading"><div><p className="chapter-kicker">{t('03 / 我的研究方向', '03 / MY RESEARCH DIRECTIONS')}</p><h2 id="directions-title">{t('研究方向', 'Research directions.')}</h2></div><p>{t('从模型到空间，再到环境数据。三条方向，各有一个下一问。', 'From models to spaces, then environmental data. Three directions, each with a question ahead.') }</p></div>

      <div ref={agentRef} className="rd-entry rd-agent-entry">
        <article className="rd-agent-scene" aria-labelledby="rd-agent-title">
          <div className="rd-agent-intro"><span className="rd-scene-number">01 / AGENTS</span><h3 id="rd-agent-title">{t('大模型智能体', 'LLM agents')}<br/>{t('应用开发', '& application development')}</h3><p>{t('当前关注 · 工具调用与任务验证', 'CURRENT INTEREST · TOOLS + TASK VERIFICATION')}</p></div>
          <div className="rd-agent-workspace">
            <motion.div className="rd-agent-tape-arrival" initial={reduced ? false : { x: -26, opacity: 0 }} animate={{ x: agentReady ? 0 : -26, opacity: agentReady ? 1 : 0 }} transition={slowMotion(arrival)}>
              <motion.button type="button" className="rd-agent-tape" aria-expanded={agentsOpen} aria-controls="directions-agent-details" aria-label={t('向右拉出任务纸带，或点击，阅读智能体应用研究关注', 'Pull the task ribbon to the right, or click, to read about my interest in agent applications')} drag={reduced ? false : 'x'} dragConstraints={{ left: 0, right: 64 }} dragElastic={.12} dragSnapToOrigin dragTransition={slowDragRelease} transition={slowMotion({ type: "spring", stiffness: 300, damping: 32 })} onDragEnd={(_, info) => { if (info.offset.x > 25) setAgentsOpen(true) }} onClick={() => setAgentsOpen(!agentsOpen)} whileTap={reduced ? undefined : { scale: .99 }}>
                <span className="rd-tape-holes" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index}/>)}</span>
                <span className="rd-tape-index">APPLICATION NOTES / 01</span><strong>{t('把模型接到任务里。', 'Put models into task workflows.')}</strong><span className="rd-tape-instruction">{t('向右拉出', 'Pull right')}<ArrowRight size={16}/></span>
              </motion.button>
            </motion.div>
            <AnimatePresence initial={false}>{agentsOpen && <ReadingReveal className="rd-notes-reveal" initial={reduced ? false : { gridTemplateRows: "0fr" }} animate={{ gridTemplateRows: "1fr" }} exit={{ gridTemplateRows: "0fr" }} transition={slowMotion(expansion)}><motion.div id="directions-agent-details" className="rd-agent-notes" initial={reduced ? false : { x: 14, opacity: .7 }} animate={{ x: 0, opacity: 1 }} exit={{ x: reduced ? 0 : -10, opacity: reduced ? 1 : 0 }} transition={slowMotion(reading)}><span>{t('我想继续探索', 'WHAT I WANT TO EXPLORE')}</span><p>{t('把大模型、工具和任务流程连接起来，探索如何保留上下文、推进任务，并验证输出。', 'Connecting LLMs with tools and task workflows, with persistent context and outputs that can be checked.')}</p><a href="#esg">{t('相关实践 / ESG 文档 AI', 'Related practice / ESG document AI')}<ArrowUpRight size={16}/></a></motion.div></ReadingReveal>}</AnimatePresence>
          </div>
          <button type="button" className="rd-agent-toggle" aria-expanded={agentsOpen} aria-controls="directions-agent-details" onClick={() => setAgentsOpen(!agentsOpen)}>{agentsOpen ? t('收起研究关注', 'Close the notes') : t('展开研究关注', 'Read the notes')}{agentsOpen ? <Minus size={15}/> : <Plus size={15}/>}</button>
        </article>
      </div>

      <div className="rd-lower-scenes">
        <div ref={spatialRef} className="rd-entry rd-spatial-entry">
          <article className="rd-spatial-scene" aria-labelledby="rd-spatial-title">
            <div className="rd-spatial-header"><span className="rd-scene-number">02 / SPATIAL</span><span>{t('持续研究', 'ONGOING RESEARCH')}</span></div>
            <h3 id="rd-spatial-title">{t('自动驾驶场景', 'Spatial perception')}<br/>{t('空间感知', 'for autonomous driving')}</h3>
            <div className="rd-section-stage">
              <motion.div className="rd-section-arrival" initial={reduced ? false : { y: 28, rotate: 3, opacity: 0 }} animate={{ y: spatialReady ? 0 : 28, rotate: spatialReady ? 0 : 3, opacity: spatialReady ? 1 : 0 }} transition={slowMotion(arrival)}>
                <motion.button type="button" className="rd-section-sheet" aria-expanded={spatialOpen} aria-controls="directions-spatial-details" aria-label={t('向上抽出空间剖面，或点击，阅读我的空间感知研究', 'Pull the spatial section upwards, or click, to read about my spatial-perception research')} drag={reduced ? false : 'y'} dragConstraints={{ top: -54, bottom: 0 }} dragElastic={.1} dragSnapToOrigin dragTransition={slowDragRelease} transition={slowMotion({ type: "spring", stiffness: 300, damping: 32 })} onDragEnd={(_, info) => { if (info.offset.y < -24) setSpatialOpen(true) }} onClick={() => setSpatialOpen(!spatialOpen)}>
                  <svg viewBox="0 0 420 190" aria-hidden="true"><path d="M38 143L207 182L391 112L221 72Z" fill="#e2dfd4" stroke="#546777"/><path d="M38 93L207 132L391 62L221 22Z" fill="#f9f7ed" stroke="#546777"/><path d="M38 93V143M207 132V182M391 62V112M221 22V72" stroke="#a57c56" strokeWidth="2" strokeDasharray="3 3"/><path d="M81 99L244 34M126 110L290 45M170 122L335 56M82 76L252 115M130 58L300 97M179 40L349 79" stroke="#a9b3b9" strokeWidth=".6"/><path d="M83 100L110 106L244 53L217 47Z" fill="#cb8e69"/><path d="M161 92L189 99L302 55L274 48Z" fill="#7d9fa6"/><circle cx="205" cy="76" r="5" fill="#405784"/><path d="M205 76L209 46L334 18" fill="none" stroke="#405784"/><text x="283" y="15" fill="#405784" fontSize="16">COSMOS-LOC</text><text x="45" y="165" fill="#435768" fontSize="16">SUPS / SVL</text><text x="224" y="165" fill="#435768" fontSize="16">U-IMPROVE / AVPC</text></svg>
                  <span><ArrowUp size={14}/>{t('向上抽出', 'Pull upwards')}</span>
                </motion.button>
              </motion.div>
            </div>
            <p className="rd-spatial-caption">{t('连接定位、造景与协同感知。', 'Connecting localisation, scene building and collaborative perception.')}</p>
            <AnimatePresence initial={false}>{spatialOpen && <ReadingReveal className="rd-notes-reveal" initial={reduced ? false : { gridTemplateRows: "0fr" }} animate={{ gridTemplateRows: "1fr" }} exit={{ gridTemplateRows: "0fr" }} transition={slowMotion(expansion)}><motion.div id="directions-spatial-details" className="rd-spatial-notes" initial={reduced ? false : { y: 10, opacity: .7 }} animate={{ y: 0, opacity: 1 }} exit={{ y: reduced ? 0 : -8, opacity: reduced ? 1 : 0 }} transition={slowMotion(reading)}><p>{t('从单图定位到可控仿真，再到生成式与协同感知。我在相关项目中参与模型训练与场景扩展；U-IMPROVE 毕业研究探索目标存在性、像素语义与度量几何的统一生成接口。', 'From single-image localisation to controllable simulation, then generative and collaborative perception. I contribute to model training and scene extensions; my U-IMPROVE dissertation explores a shared generation interface for target presence, pixel semantics and metric geometry.')}</p><div className="rd-spatial-links"><a href="#cosmos">Cosmos-Loc<span>{t('Qwen 训练与实验', 'Qwen training and experiments')}</span><ArrowUpRight size={14}/></a><a href="#sups">SUPS / SVL<span>{t('现有仿真场景扩展', 'Extensions to an existing simulator')}</span><ArrowUpRight size={14}/></a><a href="#glimpse">U-IMPROVE<span>{t('存在性 Strip 与语义/几何感知研究', 'Presence Strip and semantic-geometric perception')}</span><ArrowUpRight size={14}/></a><a href="#avpc">AVPC<span>{t('团队持续研究方向', 'Ongoing team research')}</span><ArrowUpRight size={14}/></a></div></motion.div></ReadingReveal>}</AnimatePresence>
            <button type="button" className="rd-spatial-toggle" aria-expanded={spatialOpen} aria-controls="directions-spatial-details" onClick={() => setSpatialOpen(!spatialOpen)}>{spatialOpen ? t('合上研究剖面', 'Close the section') : t('展开研究关联', 'Explore the connections')}{spatialOpen ? <Minus size={15}/> : <ArrowUp size={15}/>}</button>
          </article>
        </div>

        <div ref={environmentRef} className="rd-entry rd-environment-entry">
          <article className="rd-environment-scene" aria-labelledby="rd-environment-title">
            <span className="rd-scene-number">03 / ENVIRONMENT + ENERGY</span>
            <h3 id="rd-environment-title">{t('环境与能源', 'Environment & energy')}<br/>{t('数据 AI', 'data AI')}</h3>
            <p className="rd-environment-status">{t('ESG 实习实践 · 能源研究兴趣', 'ESG PRACTICE · ENERGY RESEARCH INTEREST')}</p>
            <div className="rd-evidence-stage">
              <span className="rd-evidence-underleaf" aria-hidden="true">SOURCE / CONTEXT / EVIDENCE</span>
              <motion.div className="rd-evidence-arrival" initial={reduced ? false : { x: -18, y: 19, rotate: -4, opacity: 0 }} animate={{ x: environmentReady ? 0 : -18, y: environmentReady ? 0 : 19, rotate: environmentReady ? 0 : -4, opacity: environmentReady ? 1 : 0 }} transition={slowMotion(arrival)}>
                <motion.button type="button" className="rd-evidence-leaf" aria-expanded={environmentOpen} aria-controls="directions-environment-details" aria-label={t('向右上方斜拉证据折页，或点击，阅读环境与能源数据研究方向', 'Pull the evidence leaf diagonally upwards and right, or click, to read about environmental and energy data')} drag={!reduced} dragConstraints={{ left: 0, right: 38, top: -38, bottom: 0 }} dragElastic={.1} dragSnapToOrigin dragTransition={slowDragRelease} transition={slowMotion({ type: "spring", stiffness: 300, damping: 32 })} onDragEnd={(_, info) => { if (info.offset.x > 14 && info.offset.y < -14) setEnvironmentOpen(true) }} onClick={() => setEnvironmentOpen(!environmentOpen)}>
                  <span className="rd-evidence-corner" aria-hidden="true"/><span className="rd-evidence-file">EVIDENCE / 03</span><strong>{t('一个数字，', 'A number,')}<br/>{t('和它的出处。', 'and its source.')}</strong><span className="rd-evidence-rule" aria-hidden="true"/><span className="rd-evidence-instruction">{t('向右上方拉开', 'Pull up and right')}<ArrowUpRight size={17}/></span>
                </motion.button>
              </motion.div>
            </div>
            <AnimatePresence initial={false}>{environmentOpen && <ReadingReveal className="rd-notes-reveal" initial={reduced ? false : { gridTemplateRows: "0fr" }} animate={{ gridTemplateRows: "1fr" }} exit={{ gridTemplateRows: "0fr" }} transition={slowMotion(expansion)}><motion.div id="directions-environment-details" className="rd-environment-notes" initial={reduced ? false : { x: 8, y: -8, opacity: .7 }} animate={{ x: 0, y: 0, opacity: 1 }} exit={{ x: reduced ? 0 : -6, opacity: reduced ? 1 : 0 }} transition={slowMotion(reading)}><p>{t('从 ESG 文档解析、指标标准化与证据关联出发，继续探索 AI 在环境与能源系统中的数据分析与应用。', 'Building on ESG document parsing, indicator standardisation and evidence linking, I want to explore AI for data analysis and applications in environmental and energy systems.')}</p><a href="#esg">ESG AI<span>{t('已有实践：环境文档与数据平台', 'Existing practice: environmental documents and a data platform')}</span><ArrowUpRight size={16}/></a></motion.div></ReadingReveal>}</AnimatePresence>
            <button type="button" className="rd-environment-toggle" aria-expanded={environmentOpen} aria-controls="directions-environment-details" onClick={() => setEnvironmentOpen(!environmentOpen)}>{environmentOpen ? t('合上方向笔记', 'Close the direction notes') : t('打开方向笔记', 'Open the direction notes')}{environmentOpen ? <Minus size={15}/> : <ArrowUpRight size={15}/>}</button>
          </article>
        </div>
      </div>
      <a className="chapter-link rd-next" href="#cosmos">{t('从方向，进入我的定位实验', 'From these directions to my localisation work')}<ArrowDownRight size={19}/></a>
    </div>
  </section>
}
