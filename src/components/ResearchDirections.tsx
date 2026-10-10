import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { ReadingReveal } from "./ReadingReveal";
import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { ArrowDownRight, ArrowRight, ArrowUp, ArrowUpRight, Minus, Plus } from 'lucide-react'
import { useI18n } from '../i18n'
import './research-directions.css'

interface ResearchDirectionsProps { quiet?: boolean }

function SpatialObservation({ open, reduced, onOpen, onClose }: { open: boolean; reduced: boolean; onOpen: () => void; onClose: () => void }) {
  const { t } = useI18n()
  const dragY = useMotionValue(0)
  const dragging = useMotionValue(false)
  const revealed = useMotionValue(open ? 1 : 0)
  const progress = useTransform(() => {
    const pointerY = dragY.get()
    const settled = revealed.get()
    const active = dragging.get()
    return active ? Math.max(0, Math.min(1, -pointerY / 64)) : settled
  })
  const observationY = useTransform(progress, [0, 1], [0, -30])
  const featureY = useTransform(progress, [0, 1], [125, 95])
  const geometryOpacity = useTransform(progress, [0, .12, .65], [0, 0, 1])
  const rayOpacity = useTransform(progress, [0, .08, .65], [0, .1, 1])
  const targetOpacity = useTransform(progress, [0, .38, 1], [0, 0, 1])

  useEffect(() => {
    const playback = animate(revealed, open ? 1 : 0, slowMotion({ duration: reduced ? 0 : .4, ease: [.22, 1, .36, 1] }))
    return () => playback.stop()
  }, [open, reduced, revealed])

  return <div className="rd-spatial-observation">
    <motion.button type="button" className="rd-observation-handle" style={{ y: dragY }} aria-expanded={open} aria-controls="directions-spatial-details" aria-label={t('向上拉 RGB 观察层，显露几何与地图目标的对应；也可点击打开或关闭', 'Pull the RGB observation layer upwards to reveal its connection to geometry and the map target, or click to open or close')} drag={reduced || open ? false : 'y'} dragConstraints={{ top: -64, bottom: 0 }} dragElastic={.05} dragSnapToOrigin dragTransition={slowDragRelease} onDragStart={() => dragging.set(true)} onDragEnd={() => {
      const amount = Math.max(0, Math.min(1, -dragY.get() / 64))
      revealed.set(amount)
      dragging.set(false)
      if (amount > .35) onOpen()
      else animate(revealed, 0, slowMotion({ duration: reduced ? 0 : .4, ease: [.22, 1, .36, 1] }))
    }} onClick={open ? onClose : onOpen} onKeyDown={(event) => {
      if (event.key === 'ArrowUp') { event.preventDefault(); onOpen() }
      if (event.key === 'ArrowDown' || event.key === 'Escape') { event.preventDefault(); onClose() }
    }}>
      <span className="rd-observation-grip" aria-hidden="true"/><span>{open ? t('合上观察层', 'Close the observation layer') : t('上拉 RGB 观察层', 'Pull the RGB layer upwards')}</span><ArrowUp size={18}/>
    </motion.button>
    <div className="rd-spatial-diagram" role="img" aria-label={t('研究示意：相机的 RGB 观察，与深度几何、空间地图和可查询目标相对应', 'Research illustration: a camera’s RGB observation connected to depth and geometry, a spatial map and a queryable target')}>
      <svg viewBox="0 0 520 380" aria-hidden="true">
        <path d="M39 282L250 371L491 270L280 181Z" fill="#e6e3d8" stroke="#476174" strokeWidth="2"/>
        <path d="M93 300L320 205M143 321L370 226M192 342L420 248M84 260L300 351M128 241L345 332M173 222L390 314M219 204L435 295" stroke="#9aa9b1" strokeWidth="2"/>
        <path d="M267 250L290 260L334 242L311 232Z M347 286L370 296L414 278L391 268Z" fill="#869ba0" stroke="#476174"/>
        <motion.path d="M100 278L296 229L344 316Z" fill="#cc90651a" stroke="#bd6b3e" strokeWidth="2" strokeDasharray="5 6" style={{ opacity: rayOpacity }}/>
        <g transform="translate(94 276) rotate(-22)"><path d="M-14-12H10V11H-14Z M10-7L22-12V11L10 6Z" fill="#365d88" stroke="#f8f6ed" strokeWidth="2"/><circle cx="-3" cy="0" r="4" fill="#f8f6ed"/><path d="M-6 12V32M-16 35L-6 25L4 35" stroke="#365d88" strokeWidth="3"/></g>
        <path d="M119 284L157 273M149 268L157 273L153 282" fill="none" stroke="#365d88" strokeWidth="3"/>
        <motion.g style={{ y: observationY }}>
          <rect x="27" y="32" width="241" height="146" rx="3" fill="#f8f6ed" stroke="#365d88" strokeWidth="2"/>
          <path d="M35 118L142 66L259 117V168H35Z" fill="#d8dcd3"/>
          <path d="M36 168L141 102L259 168M70 168L141 102L228 168M102 168L141 102L194 168" fill="none" stroke="#66818d" strokeWidth="2"/>
          <path d="M179 118H221L234 141H168Z M183 109H212L221 118H175Z" fill="#3e6289"/>
          <circle cx="201" cy="125" r="8" fill="#e9c77a" stroke="#bd6b3e" strokeWidth="2"/>
          <path d="M36 49H69M36 49V74M250 49H229M250 49V74" stroke="#365d88" strokeWidth="2"/>
        </motion.g>
        <motion.g style={{ opacity: geometryOpacity }}>
          <path d="M306 102L466 130L446 213L286 185Z" fill="#e5cfa4" stroke="#bd6b3e" strokeWidth="2"/>
          <path d="M306 102L337 109L317 191L286 185Z" fill="#d09c67"/>
          <path d="M359 111L390 117L370 199L337 194Z" fill="#ceaa76"/>
          <path d="M415 121L466 130L446 213L396 204Z" fill="#f4e5c3"/>
          <path d="M293 162L451 190M298 140L456 167" stroke="#ad7950" strokeWidth="1.5"/>
        </motion.g>
        <motion.line x1="201" y1={featureY} x2="367" y2="158" stroke="#bd6b3e" strokeWidth="2.5" strokeDasharray="6 5" style={{ opacity: rayOpacity }}/>
        <motion.path d="M367 158L317 289" stroke="#bd6b3e" strokeWidth="2.5" strokeDasharray="6 5" style={{ opacity: rayOpacity }}/>
        <motion.g style={{ opacity: targetOpacity }}><path d="M294 289L317 279L340 289L317 299Z" fill="#bc613f" stroke="#f8f6ed" strokeWidth="2"/><path d="M285 289L317 275L349 289L317 303Z" fill="none" stroke="#bd6b3e" strokeWidth="2"/><path d="M317 279V255M304 262L317 251L330 262" fill="none" stroke="#bd6b3e" strokeWidth="2"/></motion.g>
      </svg>
    </div>
    <div className="rd-spatial-legend"><span>{t('相机 / RGB 观察', 'Camera / RGB observation')}</span><ArrowDownRight size={18}/><span>{t('深度与几何', 'Depth and geometry')}</span><ArrowDownRight size={18}/><span>{t('空间地图 / 目标', 'Spatial map / target')}</span></div>
    <p className="rd-spatial-instruction">{t('上拉观察层，查看投影线与地图目标怎样对应。', 'Pull the observation layer to reveal the projection lines and their map target.')}</p>
  </div>
}

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
      <div className="rd-heading"><div><p className="chapter-kicker">{t('01 / 我的研究方向', '01 / MY RESEARCH DIRECTIONS')}</p><h2 id="directions-title">{t('研究方向', 'Research directions.')}</h2></div><p>{t('从模型到空间，再到环境数据。三条方向，各有一个下一问。', 'From models to spaces, then environmental data. Three directions, each with a question ahead.') }</p></div>

      <div ref={agentRef} className="rd-entry rd-agent-entry">
        <article className="rd-agent-scene" aria-labelledby="rd-agent-title">
          <div className="rd-agent-intro"><span className="rd-scene-number">01 / AGENTS</span><h3 id="rd-agent-title">{t('大模型智能体', 'LLM agents')}<br/>{t('应用开发', '& application development')}</h3><p>{t('当前关注 · 工具调用与任务验证', 'CURRENT INTEREST · TOOLS + TASK VERIFICATION')}</p></div>
          <div className="rd-agent-workspace">
            <motion.div className="rd-agent-tape-arrival" initial={reduced ? false : { x: -26, opacity: 0 }} animate={{ x: agentReady ? 0 : -26, opacity: agentReady ? 1 : 0 }} transition={slowMotion(arrival)}>
              <motion.button type="button" className="rd-agent-tape" aria-expanded={agentsOpen} aria-controls="directions-agent-details" aria-label={t('向右拉出任务纸带，或点击，阅读智能体应用研究关注', 'Pull the task ribbon to the right, or click, to read about my interest in agent applications')} drag={reduced ? false : 'x'} dragConstraints={{ left: 0, right: 64 }} dragElastic={.12} dragSnapToOrigin dragTransition={slowDragRelease} transition={slowMotion({ type: "spring", stiffness: 300, damping: 32 })} onDragEnd={(_, info) => { if (info.offset.x > 25) setAgentsOpen(true) }} onClick={() => setAgentsOpen(!agentsOpen)} whileTap={reduced ? undefined : { scale: .99 }}>
                <span className="rd-tape-holes" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index}/>)}</span>
                <span className="rd-tape-index">01</span><strong>{t('把模型接到任务里。', 'Put models into task workflows.')}</strong><svg className="rd-task-sketch" viewBox="0 0 260 72" aria-hidden="true"><path d="M4 12H60V61H4Z M10 24H44M10 33H47M10 42H34" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M75 36H104M96 29L104 36L96 43 M167 36H194M186 29L194 36L186 43" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="134" cy="36" r="22" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M126 28L142 44M142 28L126 44" stroke="currentColor" strokeWidth="2"/><path d="M211 10H249V60H211Z" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="225" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M231 36L240 45M217 52H239" stroke="currentColor" strokeWidth="2"/></svg><span className="rd-task-meaning">{t('上下文 → 工具 → 核验', 'Context → tools → checks')}</span><span className="rd-tape-instruction">{t('向右拉出', 'Pull right')}<ArrowRight size={16}/></span>
              </motion.button>
            </motion.div>
            <AnimatePresence initial={false}>{agentsOpen && <ReadingReveal className="rd-notes-reveal" initial={reduced ? false : { gridTemplateRows: "0fr" }} animate={{ gridTemplateRows: "1fr" }} exit={{ gridTemplateRows: "0fr" }} transition={slowMotion(expansion)}><motion.div id="directions-agent-details" className="rd-agent-notes" initial={reduced ? false : { x: 14, opacity: .7 }} animate={{ x: 0, opacity: 1 }} exit={{ x: reduced ? 0 : -10, opacity: reduced ? 1 : 0 }} transition={slowMotion(reading)}><p className="rd-question">{t('一个智能体，怎样把需求变成可推进、可检查的任务？', 'How can an agent turn a request into a task that can progress and be checked?')}</p><p>{t('我想从清晰的应用任务入手，把上下文、工具调用与结果检查拆成可验证的步骤，再比较不同流程的稳定性。', 'I want to start with a clearly defined application task, make context, tool use and result checks into testable steps, then compare how reliably different workflows progress.')}</p><a href="#esg">{t('实践入口 / ESG AI', 'Related practice / ESG AI')}<ArrowUpRight size={16}/></a></motion.div></ReadingReveal>}</AnimatePresence>
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
                <SpatialObservation open={spatialOpen} reduced={reduced} onOpen={() => setSpatialOpen(true)} onClose={() => setSpatialOpen(false)}/>
              </motion.div>
            </div>
            <AnimatePresence initial={false}>{spatialOpen && <ReadingReveal className="rd-notes-reveal" initial={reduced ? false : { gridTemplateRows: "0fr" }} animate={{ gridTemplateRows: "1fr" }} exit={{ gridTemplateRows: "0fr" }} transition={slowMotion(expansion)}><motion.div id="directions-spatial-details" className="rd-spatial-notes" initial={reduced ? false : { y: 10, opacity: .7 }} animate={{ y: 0, opacity: 1 }} exit={{ y: reduced ? 0 : -8, opacity: reduced ? 1 : 0 }} transition={slowMotion(reading)}><p className="rd-question">{t('环境和目标变化时，感知结果怎样仍能支持可靠的空间判断？', 'When environments and targets change, how can perception still support reliable spatial decisions?')}</p><p>{t('我想把同一问题放进真实图像与可控场景里比较，追踪失败条件，并研究不同视角的信息怎样互相补充。', 'I want to compare the same question in real images and controllable scenes, track the conditions that lead to failure, and study how information from different viewpoints can complement each other.')}</p><div className="rd-spatial-links"><a href="#cosmos">Cosmos-Loc<ArrowUpRight size={14}/></a><a href="#sups">SUPS / SVL<ArrowUpRight size={14}/></a><a href="#glimpse">U-IMPROVE<ArrowUpRight size={14}/></a><a href="#avpc">AVPC<ArrowUpRight size={14}/></a></div></motion.div></ReadingReveal>}</AnimatePresence>
            <button type="button" className="rd-spatial-toggle" aria-expanded={spatialOpen} aria-controls="directions-spatial-details" onClick={() => setSpatialOpen(!spatialOpen)}>{spatialOpen ? t('合上研究剖面', 'Close the section') : t('展开研究关联', 'Explore the connections')}{spatialOpen ? <Minus size={15}/> : <ArrowUp size={15}/>}</button>
          </article>
        </div>

        <div ref={environmentRef} className="rd-entry rd-environment-entry">
          <article className="rd-environment-scene" aria-labelledby="rd-environment-title">
            <span className="rd-scene-number">03 / ENVIRONMENT + ENERGY</span>
            <h3 id="rd-environment-title">{t('环境与能源', 'Environment & energy')}<br/>{t('数据 AI', 'data AI')}</h3>
            <p className="rd-environment-status">{t('ESG 实习实践 · 能源研究兴趣', 'ESG PRACTICE · ENERGY RESEARCH INTEREST')}</p>
            <div className="rd-evidence-stage">
              <span className="rd-evidence-underleaf" aria-hidden="true"/>
              <motion.div className="rd-evidence-arrival" initial={reduced ? false : { x: -18, y: 19, rotate: -4, opacity: 0 }} animate={{ x: environmentReady ? 0 : -18, y: environmentReady ? 0 : 19, rotate: environmentReady ? 0 : -4, opacity: environmentReady ? 1 : 0 }} transition={slowMotion(arrival)}>
                <motion.button type="button" className="rd-evidence-leaf" aria-expanded={environmentOpen} aria-controls="directions-environment-details" aria-label={t('向右上方斜拉证据折页，或点击，阅读环境与能源数据研究方向', 'Pull the evidence leaf diagonally upwards and right, or click, to read about environmental and energy data')} drag={!reduced} dragConstraints={{ left: 0, right: 38, top: -38, bottom: 0 }} dragElastic={.1} dragSnapToOrigin dragTransition={slowDragRelease} transition={slowMotion({ type: "spring", stiffness: 300, damping: 32 })} onDragEnd={(_, info) => { if (info.offset.x > 14 && info.offset.y < -14) setEnvironmentOpen(true) }} onClick={() => setEnvironmentOpen(!environmentOpen)}>
                  <span className="rd-evidence-corner" aria-hidden="true"/><span className="rd-evidence-file">03</span><strong>{t('一个数字，', 'A number,')}<br/>{t('和它的出处。', 'and its source.')}</strong><svg className="rd-source-sketch" viewBox="0 0 220 85" aria-hidden="true"><path d="M8 8H63L83 28V76H8Z M63 8V28H83M20 40H63M20 51H57M20 62H49" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M97 43H131M123 36L131 43L123 50" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M146 22H208V66H146Z M158 36H195M158 48H183" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M34 62L106 79L171 57" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/></svg><span className="rd-evidence-meaning">{t('来源页 ↔ 指标条目', 'Source page ↔ indicator')}</span><span className="rd-evidence-instruction">{t('向右上方拉开', 'Pull up and right')}<ArrowUpRight size={17}/></span>
                </motion.button>
              </motion.div>
            </div>
            <AnimatePresence initial={false}>{environmentOpen && <ReadingReveal className="rd-notes-reveal" initial={reduced ? false : { gridTemplateRows: "0fr" }} animate={{ gridTemplateRows: "1fr" }} exit={{ gridTemplateRows: "0fr" }} transition={slowMotion(expansion)}><motion.div id="directions-environment-details" className="rd-environment-notes" initial={reduced ? false : { x: 8, y: -8, opacity: .7 }} animate={{ x: 0, y: 0, opacity: 1 }} exit={{ x: reduced ? 0 : -6, opacity: reduced ? 1 : 0 }} transition={slowMotion(reading)}><p className="rd-question">{t('不同来源的环境与能源数据，怎样变得可追溯、可比较，也能支持分析？', 'How can environmental and energy data from different sources become traceable, comparable and useful for analysis?')}</p><p>{t('我想先梳理数据定义、来源证据与验证规则，再研究 AI 怎样帮助发现关系与异常。能源系统是希望继续拓展的研究兴趣。', 'I want to begin with data definitions, source evidence and validation rules, then study how AI can help identify relationships and anomalies. Energy systems are a research interest I hope to develop further.')}</p><a href="#esg">ESG AI<ArrowUpRight size={16}/></a></motion.div></ReadingReveal>}</AnimatePresence>
            <button type="button" className="rd-environment-toggle" aria-expanded={environmentOpen} aria-controls="directions-environment-details" onClick={() => setEnvironmentOpen(!environmentOpen)}>{environmentOpen ? t('合上方向笔记', 'Close the direction notes') : t('打开方向笔记', 'Open the direction notes')}{environmentOpen ? <Minus size={15}/> : <ArrowUpRight size={15}/>}</button>
          </article>
        </div>
      </div>
      <a className="chapter-link rd-next" href="#glimpse">{t('接下来：我的毕业研究', 'Next: my final-year research')}<ArrowDownRight size={19}/></a>
    </div>
  </section>
}
