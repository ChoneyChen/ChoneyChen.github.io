import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight, Github, MoveUpRight, Volume2, VolumeX, X, Plus, Minus } from 'lucide-react'
import MaterialField from './components/MaterialField'
import ExperimentPanel from './components/ExperimentPanel'
import { experienceTimeline, profile, projects } from './data/content'
import type { ProjectId } from './data/content'

const transition = { type: 'spring' as const, stiffness: 150, damping: 24, mass: .8 }
const gestureNames: Record<ProjectId, string> = {
  cosmos: '方向键 / 寻找地标', glimpse: '擦开 / 询问不存在', esg: '拖拽 / 让数字落稳',
  mask: '连击 / 观察控制边界', sups: '切层 / 改变空间条件', avpc: '磁吸 / 保留不同意见',
}
function getInitialProject() {
  const id = window.location.hash.replace('#project/', '')
  return projects.find((project) => project.id === id)?.id ?? null
}

export default function App() {
  const [active, setActive] = useState<ProjectId | null>(getInitialProject)
  const [energy, setEnergy] = useState(0)
  const [sound, setSound] = useState(false)
  const [archiveYear, setArchiveYear] = useState('全部')
  const [openExperience, setOpenExperience] = useState<string | null>(null)
  const [instructions, setInstructions] = useState(false)
  const [quiet, setQuiet] = useState(false)
  const systemReduced = useReducedMotion()
  const reduced = quiet || !!systemReduced
  const pointer = useRef({ x: 0, y: 0, down: false, dx: 0, dy: 0 })
  const dragOrigin = useRef({ x: 0, y: 0 })
  const field = useRef<HTMLElement>(null)
  const audio = useRef<AudioContext | null>(null)
  const project = projects.find((item) => item.id === active)
  const updateEnergy = useCallback((value: number) => setEnergy(value), [])

  useEffect(() => {
    const handleHash = () => {
      if (!window.location.hash || window.location.hash.startsWith('#project/')) setActive(getInitialProject())
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])
  useEffect(() => () => { void audio.current?.close() }, [])

  const play = useCallback((frequency = 220) => {
    if (!sound) return
    const context = audio.current ?? new AudioContext()
    audio.current = context
    void context.resume()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * .55, context.currentTime + .16)
    gain.gain.setValueAtTime(.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(.045, context.currentTime + .015)
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .2)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(); oscillator.stop(context.currentTime + .22)
  }, [sound])

  const select = (id: ProjectId | null) => {
    setActive(id); setEnergy(0); play(id ? 280 + projects.findIndex((p) => p.id === id) * 35 : 200)
    history.pushState(null, '', id ? `#project/${id}` : window.location.pathname)
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })
  }
  const movePointer = (event: PointerEvent<HTMLElement>) => {
    const bounds = field.current!.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width * 2 - 1
    const y = (event.clientY - bounds.top) / bounds.height * 2 - 1
    pointer.current.dx = pointer.current.down ? x - dragOrigin.current.x : 0
    pointer.current.dy = pointer.current.down ? y - dragOrigin.current.y : 0
    pointer.current.x = x; pointer.current.y = y
  }
  const release = () => { pointer.current.down = false; pointer.current.dx = 0; pointer.current.dy = 0; play(160) }
  const yearEntries = experienceTimeline.filter((item) => archiveYear === '全部' || item.year.includes(archiveYear))

  return <div className={reduced ? 'site is-static' : 'site'}>
    <a className="skip-link" href="#reading">跳到正文</a>
    <header className="masthead">
      <button className="wordmark" onClick={() => select(null)} aria-label="回到首页"><span className="pixel-mark" aria-hidden="true"><i /><i /><i /><i /></span>CHONEY<span className="wordmark-slash">/</span><span className="wordmark-cn">未定形</span></button>
      <span className="masthead-note mono">PERSONAL EXPERIMENT / 2026</span>
      <nav aria-label="主导航">
        <a href="#archive">经历档案<span className="nav-dot" /></a>
        <a href="#about">关于我</a>
        <button className="icon-button sound-button" onClick={() => { setSound(!sound); if (!sound) void (audio.current ??= new AudioContext()).resume() }} aria-label={sound ? '关闭声音' : '开启声音'} aria-pressed={sound}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
        <a className="icon-button" href="https://github.com/ChoneyChen" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a>
      </nav>
    </header>

    <main>
      <section ref={field} className={`material-stage ${active ? 'has-project' : 'is-home'}`} aria-label="像素与液态玻璃交互实验场">
        <MaterialField mode={active ?? 'home'} energy={energy} pointer={pointer} reducedMotion={reduced} />
        <div className="stage-grain" aria-hidden="true" />
        <div className="stage-corner corner-a" aria-hidden="true" /><div className="stage-corner corner-b" aria-hidden="true" />
        <div className="stage-topline mono"><span><i className="live-dot" /> OPEN TO CURIOSITY</span><span>SUZHOU, CN <span className="coordinates">31° N / 120° E</span></span></div>
        <AnimatePresence mode="wait">
          <motion.div className="stage-copy" key={active ?? 'home'} initial={{ opacity: 0, y: reduced ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -12 }} transition={{ duration: reduced ? 0 : .32 }}>
            {project ? <>
              <button className="back-home mono" onClick={() => select(null)}><X size={12} /> ALL STATES / 回到未定形</button>
              <span className="scene-number mono">{project.number} / 06 <span>{project.tags[0]}</span></span>
              <h1 className={`project-heading ${project.id === 'mask' ? 'heading-cn' : ''}`}>{project.title}</h1>
              <p className="project-subtitle">{project.subtitle}</p>
              <p className="scene-question">{project.question}</p>
              <a href={`#project/${project.id}`} onClick={(event) => { event.preventDefault(); document.getElementById('reading')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' }) }} className="read-link">读项目与我的工作 <ArrowDown size={15} /></a>
            </> : <>
              <span className="eyebrow mono">Tianyi Chen / 陈天一</span>
              <h1 className="home-heading">BETWEEN<span className="heading-last">ST<span className="liquid-letter">A</span>TES<span className="pixel-period">.</span></span></h1>
              <div className="home-heading-note"><span className="tiny-pixel" /> 不急着成为一种形状。</div>
            </>}
          </motion.div>
        </AnimatePresence>

        <div className="material-interaction" role="button" tabIndex={0} aria-label="拖拽或按住挤压玻璃像素体；键盘按空格或回车挤压" onPointerDown={(event) => { movePointer(event); dragOrigin.current = { x: pointer.current.x, y: pointer.current.y }; pointer.current.down = true; event.currentTarget.setPointerCapture(event.pointerId); play(320) }} onPointerMove={movePointer} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={() => { pointer.current.down = false }} onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); pointer.current.down = true } }} onKeyUp={(event) => { if (event.key === ' ' || event.key === 'Enter') { release() } }} onBlur={() => { pointer.current.down = false }}>
          <span className="material-label mono">CONTINUOUS ↔ DISCRETE</span>
          <span className="material-hint">拖拽 / 按住挤压 <MoveUpRight size={12} /></span>
        </div>

        <AnimatePresence mode="wait">
          <motion.aside className="stage-aside" key={active ?? 'intro'} initial={{ opacity: 0, x: reduced ? 0 : 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .3 }}>
            {project ? <>
              <div className="aside-project-meta mono"><span>{project.year}</span><i style={{ background: project.accent }} /></div>
              <p className="stage-status">{project.status}</p>
              <div className="experiment-caption"><span className="mono">TRY SOMETHING</span><span>{gestureNames[project.id]}</span></div>
              <ExperimentPanel projectId={project.id} onEnergy={updateEnergy} reducedMotion={reduced} />
            </> : <>
              <span className="intro-index mono">ABOUT THE PERSON</span>
              <h2>寻找线索。<br />建立理解。<br /><span>把它做成系统。</span></h2>
              <p>我是 Choney，研究视觉与空间感知，<br className="desktop-br" />也把 AI 带进环境数据和软硬件原型。</p>
              <div className="intro-school"><span className="tiny-pixel" /> XJTLU <span className="mono">/ BEng · Stage 4</span></div>
              <a className="intro-explore" href="#projects">从一条线索开始 <ArrowDown size={15} /></a>
            </>}
          </motion.aside>
        </AnimatePresence>

        <div className="stage-bottomline"><button className="how-button mono" onClick={() => setInstructions(!instructions)} aria-expanded={instructions}>{instructions ? <Minus size={12} /> : <Plus size={12} />} HOW TO TOUCH</button><span className="mono">A LITTLE CURIOUS. A LITTLE UNFINISHED.</span><button className="motion-button mono" onClick={() => setQuiet(!quiet)} aria-pressed={reduced} aria-label={quiet ? '恢复动态' : '减少动态'}>{reduced ? 'MOTION / QUIET' : 'MOTION / ON'}</button><span className="folio mono">001 — ∞</span></div>
        <AnimatePresence>{instructions && <motion.div className="touch-guide" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={transition}><p>拖住中央物体，它会拉伸；按住，它会收缩。<br />选一个项目，试试方向键、擦开、连击或磁吸。</p><span>手机可拖动，也有按钮替代。项目正文随时可读。</span></motion.div>}</AnimatePresence>
      </section>

      <section id="projects" className="project-rail" aria-label="项目选择">
        <div className="rail-intro"><span className="mono">SIX THREADS</span><span>六条线索<br /><i>随意进入。</i></span></div>
        <div className="rail-items">{projects.map((item) => <button key={item.id} className={`rail-item ${active === item.id ? 'active' : ''}`} onClick={() => select(item.id)} aria-pressed={active === item.id} style={{ '--project-accent': item.accent } as React.CSSProperties}>
          <span className="rail-top mono">{item.number}<ArrowUpRight size={14} /></span><span className="rail-title">{item.title}</span><span className="rail-subtitle">{item.id === 'cosmos' ? '我在哪里' : item.id === 'glimpse' ? '我看见什么' : item.id === 'esg' ? '证据从哪里来' : item.id === 'mask' ? '怎样可靠行动' : item.id === 'sups' ? '改变现实条件' : '拼合不同视角'}</span>
        </button>)}</div>
      </section>

      <section id="reading" className="reading-section">
        <div className="reading-top mono"><span>{project ? `FIELD NOTES / ${project.number}` : 'A PERSONAL PRACTICE'}</span><span>观察 → 理解 → 验证</span></div>
        {project ? <motion.article key={project.id} initial={{ opacity: 0, y: reduced ? 0 : 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .35 }}>
          <div className="project-reading-header"><div><span className="reading-kicker">{project.role}</span><h2>{project.question}</h2></div><span className="big-index" aria-hidden="true">{project.number}</span></div>
          <div className="project-reading-grid"><div className="project-story"><p>{project.description}</p><div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="project-links">{project.links?.map((link) => <a href={link.url} key={link.url} target="_blank" rel="noreferrer">{link.label}<ArrowUpRight size={15} /></a>)}</div></div><div className="contribution-list"><h3 className="mono">MY PART / 我做的事</h3>{project.contributions.map((item, index) => <p key={item}><span className="mono">0{index + 1}</span>{item}</p>)}</div></div>
          <div className="result-strip">{project.results.map((result) => <div key={result.label}><span>{result.label}</span><strong>{result.value}</strong><p>{result.note}</p></div>)}</div>
          {project.id === 'mask' && <figure className="prototype-figure"><img src="/project-assets/mask-shell-three-quarter.png" loading="lazy" alt="智能光疗面罩真实外壳 STL 模型的斜视渲染，可见眼部开孔与内部结构" /><figcaption><span className="mono">PHYSICAL PROTOTYPE / V4.0</span><span>项目真实外壳模型 · 机械设计原型</span></figcaption></figure>}
          <p className="research-boundary"><span className="boundary-mark">*</span>{project.boundary}</p>
          <button className="next-project" onClick={() => select(projects[(projects.indexOf(project) + 1) % projects.length].id)}><span>换一条线索</span><strong>{projects[(projects.indexOf(project) + 1) % projects.length].title}</strong><ArrowUpRight size={25} /></button>
        </motion.article> : <div className="practice-intro"><span className="vertical-note mono">REAL WORLD / MANY FORMS</span><h2>复杂的现实，<br />值得多看一眼<span>。</span></h2><div><p>停车场里一根重复的柱子，<br />报告中一个没有口径的数字，<br />模型建议与硬件动作之间的距离。</p><p>我的项目看起来各不相同。<br />它们都从一个具体问题出发，<br />走向可以检查、可以再试的系统。</p><a href="#archive">沿着时间找线索 <ArrowDown size={14} /></a></div></div>}
      </section>

      <section id="archive" className="archive-section">
        <div className="archive-heading"><div><span className="mono">THE THINGS THAT LED HERE</span><h2>不是一条直线<span className="pixel-period">.</span></h2></div><p>研究、课程、实习与原型。<br />一些完成了，一些仍在生长。</p></div>
        <div className="archive-toolbar"><span className="mono">EXPERIENCE INDEX / {String(yearEntries.length).padStart(2, '0')}</span><div aria-label="按年份筛选">{['全部', '2026', '2025', '2024', '2023'].map((year) => <button key={year} className={archiveYear === year ? 'active' : ''} aria-pressed={archiveYear === year} onClick={() => { setArchiveYear(year); setOpenExperience(null) }}>{year}</button>)}</div></div>
        <div className="archive-list">{yearEntries.map((item, index) => {
          const isOpen = openExperience === item.id
          return <div className={`archive-entry ${isOpen ? 'is-open' : ''}`} key={item.id}><button className="archive-entry-button" onClick={() => setOpenExperience(isOpen ? null : item.id)} aria-expanded={isOpen} aria-controls={`experience-${item.id}`}><span className="entry-index mono">{String(index + 1).padStart(2, '0')}</span><span className="entry-date mono">{item.year}</span><span className="entry-title">{item.title}<small>{item.subtitle}</small></span><span className="entry-status">{item.status}</span><span className="entry-plus">{isOpen ? <Minus size={18} /> : <Plus size={18} />}</span></button><AnimatePresence initial={false}>{isOpen && <motion.div id={`experience-${item.id}`} className="entry-content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .3 }}><div><span className="entry-role">{item.role}</span><p>{item.description}</p><div className="entry-tags mono">{item.tags.join(' / ')}</div>{item.boundary && <p className="entry-boundary">{item.boundary}</p>}{item.projectId && <button className="entry-project-link" onClick={() => select(item.projectId!)}>进入项目实验 <ArrowUpRight size={14} /></button>}{item.links?.map((link) => <a className="entry-project-link" key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<ArrowUpRight size={14} /></a>)}</div></motion.div>}</AnimatePresence></div>
        })}</div>
      </section>

      <section id="about" className="about-section"><span className="mono about-index">A PERSON, STILL BECOMING.</span><div className="about-layout"><h2>CHONEY<span>陈天一 / Tianyi Chen</span><i>未定形。</i></h2><div className="about-text"><p>{profile.introduction}</p><div className="education-note"><span className="tiny-pixel" /><div><strong>{profile.education.university}</strong><span>{profile.education.programme} / {profile.education.degree}</span><span>{profile.education.period}</span></div></div><span className="mono next-label">NEXT QUESTIONS</span>{profile.nextQuestions.map((question) => <p className="next-question" key={question}>{question}<ArrowUpRight size={14} /></p>)}</div></div><div className="about-bottom"><span className="mono">{profile.interests.join(' / ')}</span><a href="https://github.com/ChoneyChen" target="_blank" rel="noreferrer">在 GitHub 继续相遇 <ArrowUpRight size={17} /></a></div></section>
    </main>
    <footer><a className="wordmark footer-wordmark" href="#" onClick={(event) => { event.preventDefault(); select(null) }}>CHONEY / 未定形</a><span className="mono">© {new Date().getFullYear()} TIANYI CHEN</span><a href="https://github.com/ChoneyChen/ChoneyChen.github.io" target="_blank" rel="noreferrer" className="mono">SOURCE <ArrowUpRight size={12} /></a><button className="mono" onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })}>BACK TO TOP ↑</button></footer>
  </div>
}
