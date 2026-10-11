import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { ReadingReveal } from "./ReadingReveal";
import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { ArrowDownRight, ArrowRight, ArrowUp, ArrowUpRight } from 'lucide-react'
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
  </div>
}

export function ResearchDirections({ quiet = false }: ResearchDirectionsProps) {
  const { t } = useI18n();
  const systemQuiet = useReducedMotion();
  const reduced = quiet || Boolean(systemQuiet);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [spatialOpen, setSpatialOpen] = useState(false);
  const [environmentOpen, setEnvironmentOpen] = useState(false);
  useCollapseOnLeave("directions", () => { setAgentsOpen(false); setSpatialOpen(false); setEnvironmentOpen(false); });
  const group = useRef<HTMLDivElement>(null);
  const present = useInView(group);
  const ready = reduced || present;
  const expansion = slowMotion({ duration: reduced ? 0 : .36 });
  return <section id="directions" className={`chapter research-directions${reduced ? ' is-quiet' : ''}`} aria-labelledby="directions-title"><div className="chapter-inner">
    <header className="rd-heading"><div><p className="chapter-kicker">{t('01 / 研究兴趣', '01 / RESEARCH INTERESTS')}</p><h2 id="directions-title" className="project-title">{t('三个研究方向', 'Three research directions.')}</h2></div><p className="project-summary">{t('大模型应用、驾驶场景感知、环境与能源数据。', 'AI applications, driving perception, and environmental data.')}</p></header>
    <div className="rd-directions-grid" ref={group}>
      <article className="rd-agent-scene rd-direction" aria-labelledby="rd-agent-title">
        <span className="rd-scene-number">01 / AGENTS</span><h3 id="rd-agent-title">{t('大模型智能体应用开发', 'LLM agent application development')}</h3>
        <p className="rd-interest-summary">{t('把上下文、工具与核验连接为可追踪的应用流程。', 'Context, tools and verification, connected into traceable application workflows.')}</p>
        <motion.div className="rd-agent-workspace" initial={reduced ? false : { x: -18, opacity: 0 }} animate={{ x: ready ? 0 : -18, opacity: ready ? 1 : 0 }} transition={slowMotion({ duration: reduced ? 0 : .65, ease: [.22, 1, .36, 1] })}>
          <motion.button className="rd-agent-tape" aria-expanded={agentsOpen} aria-controls="directions-agent-details" drag={reduced ? false : 'x'} dragConstraints={{ left: 0, right: 42 }} dragElastic={.08} dragSnapToOrigin dragTransition={slowDragRelease} onDragEnd={(_, info) => { if (info.offset.x > 18) setAgentsOpen(true); }} onClick={() => setAgentsOpen(!agentsOpen)}>
            <span className="rd-tape-holes" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i}/>)}</span>
            <svg viewBox="0 0 270 160" aria-hidden="true"><path d="M17 49H71V114H17Z M26 62H59M26 74H62M26 86H49 M200 49H253V114H200Z M211 70L222 82L243 61M210 98H241" stroke="currentColor" fill="none" strokeWidth="2"/><motion.circle cx="135" cy="81" r="28" fill="none" stroke="currentColor" strokeWidth="2" animate={{ pathLength: ready ? 1 : 0, rotate: agentsOpen ? 90 : 0 }} transition={slowMotion({duration: reduced ? 0 : .65})}/><motion.path d="M79 81H99M170 81H190M91 75L99 81L91 87M182 75L190 81L182 87M128 69H142V92H128Z" fill="none" stroke="currentColor" strokeWidth="2" animate={{ pathLength: agentsOpen ? 1 : .3 }} transition={slowMotion({duration: reduced ? 0 : .6})}/><motion.g animate={{opacity: agentsOpen ? 1 : 0, y: agentsOpen ? 0 : 16}} transition={slowMotion({duration: reduced ? 0 : .45})}><path d="M109 132H158M208 132H241" stroke="currentColor" strokeWidth="3"/><path d="M213 137L220 143L235 128" stroke="currentColor" fill="none" strokeWidth="2"/></motion.g></svg>
            <strong>{t('上下文 → 工具 → 核验', 'Context → tools → checks')}</strong><span className="rd-interaction-label">{agentsOpen ? t('点击合上', 'Click to close') : t('右拉展开工作流', 'Pull right for the workflow')}<ArrowRight size={17}/></span>
          </motion.button>
        </motion.div>
        <AnimatePresence initial={false}>{agentsOpen && <ReadingReveal id="directions-agent-details" className="rd-detail" initial={{ gridTemplateRows: "0fr", opacity: 0 }} animate={{ gridTemplateRows: "1fr", opacity: 1 }} exit={{ gridTemplateRows: "0fr", opacity: 0 }} transition={expansion}><p>{t('将任务拆成输入、执行与检查三个环节，保留工具返回与来源记录；比较流程完成情况和异常处理，而不只比较模型回答。', 'Separate inputs, execution and checks; retain tool responses and source records. Compare task completion and failure handling across workflows, alongside the quality of model responses.')}</p></ReadingReveal>}</AnimatePresence>
      </article>
      <article className="rd-spatial-scene rd-direction" aria-labelledby="rd-spatial-title">
        <span className="rd-scene-number">02 / SPATIAL</span><h3 id="rd-spatial-title">{t('自动驾驶场景中的空间感知', 'Spatial perception for autonomous driving')}</h3>
        <p className="rd-interest-summary">{t('从图像语义与深度，理解位置、目标和驾驶环境。', 'Connect image semantics and depth to location, objects and driving environments.')}</p>
        <motion.div className="rd-section-arrival" initial={reduced ? false : { y: 18, opacity: 0 }} animate={{ y: ready ? 0 : 18, opacity: ready ? 1 : 0 }} transition={slowMotion({ duration: reduced ? 0 : .65, delay: reduced ? 0 : .07, ease: [.22, 1, .36, 1] })}><SpatialObservation open={spatialOpen} reduced={reduced} onOpen={() => setSpatialOpen(true)} onClose={() => setSpatialOpen(false)}/></motion.div>
        <AnimatePresence initial={false}>{spatialOpen && <ReadingReveal id="directions-spatial-details" className="rd-detail" initial={{ gridTemplateRows: "0fr", opacity: 0 }} animate={{ gridTemplateRows: "1fr", opacity: 1 }} exit={{ gridTemplateRows: "0fr", opacity: 0 }} transition={expansion}><p>{t('把图像中的语义线索与深度、地图位置关联；在真实图像和可控仿真中比较失败条件，并检验目标或环境变化带来的影响。', 'Relate image semantics to depth and map position. Compare failure conditions in real images and controlled simulations, then evaluate how changes in targets or environments affect perception.')}</p></ReadingReveal>}</AnimatePresence>
      </article>
      <article className="rd-environment-scene rd-direction" aria-labelledby="rd-environment-title">
        <span className="rd-scene-number">03 / ENVIRONMENT</span><h3 id="rd-environment-title">{t('人工智能在环境与能源系统中的数据分析与应用', 'AI data analysis and applications in environmental and energy systems')}</h3>
        <p className="rd-interest-summary">{t('保留指标的来源与定义，研究环境和能源数据应用。', 'Trace indicators to their source and definition, for environmental and energy applications.')}</p>
        <motion.div className="rd-evidence-arrival" initial={reduced ? false : { y: 18, opacity: 0 }} animate={{ y: ready ? 0 : 18, opacity: ready ? 1 : 0 }} transition={slowMotion({ duration: reduced ? 0 : .65, delay: reduced ? 0 : .14, ease: [.22, 1, .36, 1] })}>
          <motion.button className="rd-evidence-leaf" aria-expanded={environmentOpen} aria-controls="directions-environment-details" drag={!reduced} dragConstraints={{ left: 0, right: 30, top: -30, bottom: 0 }} dragElastic={.08} dragSnapToOrigin dragTransition={slowDragRelease} onDragEnd={(_, info) => { if (info.offset.x > 12 && info.offset.y < -12) setEnvironmentOpen(true); }} onClick={() => setEnvironmentOpen(!environmentOpen)}>
            <span className="rd-evidence-corner" aria-hidden="true"/><svg viewBox="0 0 270 160" aria-hidden="true"><path d="M21 29H90L112 51V124H21Z M90 29V51H112M35 68H86M35 84H91M35 101H74" fill="none" stroke="currentColor" strokeWidth="2"/><motion.path d="M130 78H158M150 71L158 78L150 85" fill="none" stroke="currentColor" strokeWidth="2" animate={{pathLength: ready ? 1 : 0}} transition={slowMotion({duration: reduced ? 0 : .7})}/><rect x="176" y="51" width="73" height="60" fill="none" stroke="currentColor" strokeWidth="2"/><motion.path d="M188 68H236M188 84H224" stroke="currentColor" fill="none" strokeWidth="2" animate={{pathLength: environmentOpen ? 1 : .2}} transition={slowMotion({duration: reduced ? 0 : .5})}/><motion.path d="M61 111L132 144L214 104" stroke="currentColor" fill="none" strokeWidth="2" strokeDasharray="5 4" animate={{pathLength: environmentOpen ? 1 : 0, opacity: environmentOpen ? 1 : 0}} transition={slowMotion({duration: reduced ? 0 : .7})}/></svg>
            <strong>{t('来源页 ↔ 数据指标', 'Source page ↔ indicator')}</strong><span className="rd-interaction-label">{environmentOpen ? t('点击合上', 'Click to close') : t('斜拉查看证据链', 'Pull diagonally for the evidence')}<ArrowUpRight size={17}/></span>
          </motion.button>
        </motion.div>
        <AnimatePresence initial={false}>{environmentOpen && <ReadingReveal id="directions-environment-details" className="rd-detail" initial={{ gridTemplateRows: "0fr", opacity: 0 }} animate={{ gridTemplateRows: "1fr", opacity: 1 }} exit={{ gridTemplateRows: "0fr", opacity: 0 }} transition={expansion}><p>{t('保留每个指标的主体、时期、单位与来源位置，先统一定义再进行比较。能源系统是后续研究兴趣，目前实践主要来自环境数据工作。', 'Retain each indicator’s entity, period, unit and source location before comparison. Environmental-data work is my current practical foundation; applications to energy systems remain a future research interest.')}</p></ReadingReveal>}</AnimatePresence>
      </article>
    </div>
  </div></section>;
}
