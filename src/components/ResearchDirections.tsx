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
  const agentRef = useRef<HTMLDivElement>(null)
  const spatialRef = useRef<HTMLDivElement>(null)
  const environmentRef = useRef<HTMLDivElement>(null)
  const agentInView = useInView(agentRef, { once: true, amount: .2 })
  const spatialInView = useInView(spatialRef, { once: true, amount: .2 })
  const environmentInView = useInView(environmentRef, { once: true, amount: .2 })
  const agentReady = reduced || agentInView
  const spatialReady = reduced || spatialInView
  const environmentReady = reduced || environmentInView
  const arrival = reduced ? { duration: 0 } : { duration: .58, ease: [.22, 1, .36, 1] as const }
  const reading = reduced ? { duration: 0 } : { duration: .22, ease: [.22, 1, .36, 1] as const }
  const expansion = reduced ? { duration: 0 } : { duration: .4, ease: [.22, 1, .36, 1] as const }

  return <section id="directions" className={`chapter research-directions${reduced ? ' is-quiet' : ''}`} aria-labelledby="directions-title">
    <div className="chapter-inner">
      <div className="rd-heading"><div><p className="chapter-kicker">{t('03 / 我的研究方向', '03 / MY RESEARCH DIRECTIONS')}</p><h2 id="directions-title">{t('我正在关注的，', 'The directions')}<br/>{t('三条方向。', 'I want to follow.')}</h2></div><p>{t('从大模型应用，到空间感知，再到环境与能源数据。', 'From LLM applications to spatial perception, then environmental and energy data.')}<br/>{t('每一条，都是接下来想继续探索的问题。', 'Each is a set of questions I want to keep exploring.')}</p></div>

      <div ref={agentRef} className="rd-entry rd-agent-entry">
        <article className="rd-agent-scene" aria-labelledby="rd-agent-title">
          <div className="rd-agent-intro"><span className="rd-scene-number">01 / AGENTS</span><h3 id="rd-agent-title">{t('大模型智能体', 'LLM agents')}<br/>{t('应用开发', '& application development')}</h3><p>{t('当前关注 · 模型、工具与任务流程', 'Current interest · models, tools and task workflows')}</p></div>
          <div className="rd-agent-workspace">
            <motion.div className="rd-agent-tape-arrival" initial={reduced ? false : { x: -26, opacity: .65 }} animate={{ x: agentReady ? 0 : -26, opacity: agentReady ? 1 : .65 }} transition={arrival}>
              <motion.button type="button" className="rd-agent-tape" aria-expanded={agentsOpen} aria-controls="directions-agent-details" aria-label={t('向右拉出任务纸带，或点击，阅读智能体应用研究关注', 'Pull the task ribbon to the right, or click, to read about my interest in agent applications')} drag={reduced ? false : 'x'} dragConstraints={{ left: 0, right: 64 }} dragElastic={.12} dragSnapToOrigin onDragEnd={(_, info) => { if (info.offset.x > 25) setAgentsOpen(true) }} onClick={() => setAgentsOpen(!agentsOpen)} whileTap={reduced ? undefined : { scale: .99 }}>
                <span className="rd-tape-holes" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index}/>)}</span>
                <span className="rd-tape-index">APPLICATION NOTES / 01</span><strong>{t('把模型接到任务里。', 'Put models into task workflows.')}</strong><span className="rd-tape-instruction">{t('向右拉出 / 点击阅读', 'Pull right / click to read')}<ArrowRight size={16}/></span>
              </motion.button>
            </motion.div>
            <p className="rd-agent-status">{t('关注工具调用、任务组织与结果验证。', 'Exploring tool use, task organisation and result verification.')}</p>
            <AnimatePresence initial={false}>{agentsOpen && <motion.div className="rd-notes-reveal" initial={reduced ? false : { height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={expansion}><motion.div id="directions-agent-details" className="rd-agent-notes" initial={reduced ? false : { x: 14, opacity: .7 }} animate={{ x: 0, opacity: 1 }} exit={{ x: reduced ? 0 : -10, opacity: reduced ? 1 : 0 }} transition={reading}><span>{t('我想继续探索', 'WHAT I WANT TO EXPLORE')}</span><p>{t('围绕大模型开发智能体应用，把工具调用、任务组织和可检查的输出连接起来。我关注的不只是回答，还包括任务如何推进、信息如何保留，以及结果怎样被验证。', 'Developing agent applications around large language models, connecting tools, task organisation and inspectable outputs. I am interested in how a task progresses, how information is retained and how its result can be checked.')}</p><a href="#esg">{t('相关实践：ESG 文档 AI 与证据工作流', 'Related practice: ESG document AI and evidence workflows')}<ArrowUpRight size={16}/></a></motion.div></motion.div>}</AnimatePresence>
          </div>
          <button type="button" className="rd-agent-toggle" aria-expanded={agentsOpen} aria-controls="directions-agent-details" onClick={() => setAgentsOpen(!agentsOpen)}>{agentsOpen ? t('收起研究关注', 'Close the notes') : t('展开研究关注', 'Read the notes')}{agentsOpen ? <Minus size={15}/> : <Plus size={15}/>}</button>
        </article>
      </div>

      <div className="rd-lower-scenes">
        <div ref={spatialRef} className="rd-entry rd-spatial-entry">
          <article className="rd-spatial-scene" aria-labelledby="rd-spatial-title">
            <div className="rd-spatial-header"><span className="rd-scene-number">02 / SPATIAL</span><span>{t('已有研究与持续方向', 'Existing work + ongoing research')}</span></div>
            <h3 id="rd-spatial-title">{t('自动驾驶场景', 'Spatial perception')}<br/>{t('空间感知', 'for autonomous driving')}</h3>
            <div className="rd-section-stage">
              <motion.div className="rd-section-arrival" initial={reduced ? false : { y: 28, rotate: 3 }} animate={{ y: spatialReady ? 0 : 28, rotate: spatialReady ? 0 : 3 }} transition={arrival}>
                <motion.button type="button" className="rd-section-sheet" aria-expanded={spatialOpen} aria-controls="directions-spatial-details" aria-label={t('向上抽出空间剖面，或点击，阅读我的空间感知研究', 'Pull the spatial section upwards, or click, to read about my spatial-perception research')} drag={reduced ? false : 'y'} dragConstraints={{ top: -54, bottom: 0 }} dragElastic={.1} dragSnapToOrigin onDragEnd={(_, info) => { if (info.offset.y < -24) setSpatialOpen(true) }} onClick={() => setSpatialOpen(!spatialOpen)}>
                  <svg viewBox="0 0 420 190" aria-hidden="true"><path d="M38 143L207 182L391 112L221 72Z" fill="#e2dfd4" stroke="#546777"/><path d="M38 93L207 132L391 62L221 22Z" fill="#f9f7ed" stroke="#546777"/><path d="M38 93V143M207 132V182M391 62V112M221 22V72" stroke="#a57c56" strokeWidth="2" strokeDasharray="3 3"/><path d="M81 99L244 34M126 110L290 45M170 122L335 56M82 76L252 115M130 58L300 97M179 40L349 79" stroke="#a9b3b9" strokeWidth=".6"/><path d="M83 100L110 106L244 53L217 47Z" fill="#cb8e69"/><path d="M161 92L189 99L302 55L274 48Z" fill="#7d9fa6"/><circle cx="205" cy="76" r="5" fill="#405784"/><path d="M205 76L209 46L334 18" fill="none" stroke="#405784"/><text x="283" y="15" fill="#405784" fontSize="16">COSMOS-LOC</text><text x="45" y="165" fill="#435768" fontSize="16">SUPS / SVL</text><text x="224" y="165" fill="#435768" fontSize="16">U-GLIMPSE / AVPC</text></svg>
                  <span><ArrowUp size={14}/>{t('向上抽出剖面 / 点击阅读', 'Pull up the section / click to read')}</span>
                </motion.button>
              </motion.div>
            </div>
            <p className="rd-spatial-caption">{t('连接定位、造景与协同感知。', 'Connecting localisation, scene building and collaborative perception.')}</p>
            <AnimatePresence initial={false}>{spatialOpen && <motion.div className="rd-notes-reveal" initial={reduced ? false : { height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={expansion}><motion.div id="directions-spatial-details" className="rd-spatial-notes" initial={reduced ? false : { y: 10, opacity: .7 }} animate={{ y: 0, opacity: 1 }} exit={{ y: reduced ? 0 : -8, opacity: reduced ? 1 : 0 }} transition={reading}><p>{t('从单张图像里的定位线索，到可以改变条件的仿真场景，再到开放词汇与协同感知。我在这些相关研究中，分别推进模型实验、场景扩展和当前研究框架。', 'From localisation clues in a single image to controllable simulation environments, then open-vocabulary and collaborative perception. Across these related records, I contribute to model experiments, scene extensions and ongoing research frameworks.')}</p><div className="rd-spatial-links"><a href="#cosmos">Cosmos-Loc<span>{t('Qwen 训练与实验', 'Qwen training and experiments')}</span><ArrowUpRight size={14}/></a><a href="#sups">SUPS / SVL<span>{t('现有仿真场景扩展', 'Extensions to an existing simulator')}</span><ArrowUpRight size={14}/></a><a href="#glimpse">U-GLIMPSE<span>{t('正在推进的毕业研究', 'Final-year research in progress')}</span><ArrowUpRight size={14}/></a><a href="#avpc">AVPC<span>{t('团队持续研究方向', 'Ongoing team research')}</span><ArrowUpRight size={14}/></a></div></motion.div></motion.div>}</AnimatePresence>
            <button type="button" className="rd-spatial-toggle" aria-expanded={spatialOpen} aria-controls="directions-spatial-details" onClick={() => setSpatialOpen(!spatialOpen)}>{spatialOpen ? t('合上研究剖面', 'Close the section') : t('展开研究关联', 'Explore the connections')}{spatialOpen ? <Minus size={15}/> : <ArrowUp size={15}/>}</button>
          </article>
        </div>

        <div ref={environmentRef} className="rd-entry rd-environment-entry">
          <article className="rd-environment-scene" aria-labelledby="rd-environment-title">
            <span className="rd-scene-number">03 / ENVIRONMENT + ENERGY</span>
            <h3 id="rd-environment-title">{t('人工智能在环境与能源系统中的', 'AI for data analysis and applications in')}<br/>{t('数据分析与应用', 'environmental & energy systems')}</h3>
            <p className="rd-environment-status">{t('环境 AI 已有实习关联；能源系统是研究兴趣。', 'Environmental AI connects to my internship; energy systems are a research interest.')}</p>
            <div className="rd-evidence-stage">
              <span className="rd-evidence-underleaf" aria-hidden="true">SOURCE / CONTEXT / EVIDENCE</span>
              <motion.div className="rd-evidence-arrival" initial={reduced ? false : { x: -18, y: 19, rotate: -4 }} animate={{ x: environmentReady ? 0 : -18, y: environmentReady ? 0 : 19, rotate: environmentReady ? 0 : -4 }} transition={arrival}>
                <motion.button type="button" className="rd-evidence-leaf" aria-expanded={environmentOpen} aria-controls="directions-environment-details" aria-label={t('向右上方斜拉证据折页，或点击，阅读环境与能源数据研究方向', 'Pull the evidence leaf diagonally upwards and right, or click, to read about environmental and energy data')} drag={!reduced} dragConstraints={{ left: 0, right: 38, top: -38, bottom: 0 }} dragElastic={.1} dragSnapToOrigin onDragEnd={(_, info) => { if (info.offset.x > 14 && info.offset.y < -14) setEnvironmentOpen(true) }} onClick={() => setEnvironmentOpen(!environmentOpen)}>
                  <span className="rd-evidence-corner" aria-hidden="true"/><span className="rd-evidence-file">EVIDENCE / 03</span><strong>{t('一个数字，', 'A number,')}<br/>{t('和它的出处。', 'and its source.')}</strong><span className="rd-evidence-rule" aria-hidden="true"/><span className="rd-evidence-instruction">{t('沿右上角拉开 / 点击阅读', 'Pull towards the top right / click to read')}<ArrowUpRight size={17}/></span>
                </motion.button>
              </motion.div>
            </div>
            <AnimatePresence initial={false}>{environmentOpen && <motion.div className="rd-notes-reveal" initial={reduced ? false : { height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={expansion}><motion.div id="directions-environment-details" className="rd-environment-notes" initial={reduced ? false : { x: 8, y: -8, opacity: .7 }} animate={{ x: 0, y: 0, opacity: 1 }} exit={{ x: reduced ? 0 : -6, opacity: reduced ? 1 : 0 }} transition={reading}><p>{t('我关注 AI 如何用于环境与能源系统的数据分析。在 ESG 实习中，我参与文档解析、指标标准化与证据关联；接下来希望继续探索这些方法与环境、能源问题之间的连接。', 'I am interested in applying AI to data analysis in environmental and energy systems. In my ESG internship, I help with document parsing, indicator standardisation and evidence linking. I want to explore how these methods connect to environmental and energy questions.')}</p><a href="#esg">ESG AI<span>{t('已有实践：环境文档与数据平台', 'Existing practice: environmental documents and a data platform')}</span><ArrowUpRight size={16}/></a><small>{t('由 ESG 文档实践，延伸到环境与能源问题。', 'Extending ESG document practice towards environmental and energy questions.')}</small></motion.div></motion.div>}</AnimatePresence>
            <button type="button" className="rd-environment-toggle" aria-expanded={environmentOpen} aria-controls="directions-environment-details" onClick={() => setEnvironmentOpen(!environmentOpen)}>{environmentOpen ? t('合上方向笔记', 'Close the direction notes') : t('打开方向笔记', 'Open the direction notes')}{environmentOpen ? <Minus size={15}/> : <ArrowUpRight size={15}/>}</button>
          </article>
        </div>
      </div>
      <a className="chapter-link rd-next" href="#cosmos">{t('从方向，进入我的定位实验', 'From these directions to my localisation work')}<ArrowDownRight size={19}/></a>
    </div>
  </section>
}
