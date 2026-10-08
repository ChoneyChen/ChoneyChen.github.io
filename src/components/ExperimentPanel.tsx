import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Link2, RotateCcw } from 'lucide-react';
import './experiment.css';

export type ExperimentId = 'cosmos' | 'glimpse' | 'esg' | 'mask' | 'sups' | 'avpc';
export interface ExperimentPanelProps {
  projectId: ExperimentId | string;
  onEnergy: (energy: number) => void;
  onFocusChange?: (focused: boolean) => void;
  reducedMotion?: boolean;
}
type SceneProps = { energy: (value: number) => void; reduced: boolean };
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const spring = { type: 'spring' as const, stiffness: 190, damping: 25 };

function Reset({ onClick, label = '重置演示' }: { onClick: () => void; label?: string }) {
  return <button className="exp-reset" onClick={onClick} aria-label={label} title={label}><RotateCcw size={13} /></button>;
}

function Cosmos({ energy, reduced }: SceneProps) {
  const [position, setPosition] = useState({ x: 212, y: 101 });
  const gridId = useId().replace(/:/g, '');
  const landmarks = [
    { x: 91, y: 49, label: '车位 1082', short: '1082' },
    { x: 335, y: 145, label: '走廊转角 C', short: 'C' },
    { x: 344, y: 46, label: '柱号 B7', short: 'B7' },
  ];
  const nearby = landmarks.map((landmark) => ({ ...landmark, distance: Math.hypot(position.x - landmark.x, position.y - landmark.y) }))
    .sort((a, b) => a.distance - b.distance)[0];
  const candidates = nearby.distance < 27 ? 1 : nearby.distance < 60 ? 2 : 5;
  const move = useCallback((x: number, y: number) => setPosition((previous) => ({ x: clamp(previous.x + x, 46, 385), y: clamp(previous.y + y, 35, 158) })), []);
  useEffect(() => energy(1 - candidates / 6), [candidates, energy]);
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta: Record<string, [number, number]> = { ArrowLeft: [-18, 0], ArrowRight: [18, 0], ArrowUp: [0, -14], ArrowDown: [0, 14] };
    if (delta[event.key]) { event.preventDefault(); move(...delta[event.key]); }
  };
  return <div className="exp-scene exp-cosmos" onKeyDown={onKey}>
    <div className="exp-stage exp-map-stage" tabIndex={0} aria-label="停车场定位示意。使用方向键移动观察位置，或使用下方方向按钮。">
      <span className="exp-corner-label">ICPARK / 观察窗口</span>
      <svg viewBox="0 0 430 195" role="img" aria-label={`当前${candidates}个候选区域。${candidates < 5 ? `观察到${nearby.label}` : '走廊外观相似，等待地标线索'}`}>
        <defs><pattern id={gridId} width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0V18" fill="none" stroke="currentColor" strokeWidth=".4" /></pattern><radialGradient id={`${gridId}-lens`} cx="32%" cy="24%"><stop stopColor="#ece8df" stopOpacity=".14" /><stop offset=".5" stopColor="#b9aed6" stopOpacity=".045" /><stop offset="1" stopColor="#b9aed6" stopOpacity=".16" /></radialGradient></defs>
        <rect x="26" y="23" width="381" height="153" fill={`url(#${gridId})`} opacity=".16" />
        <path className="exp-map-wall" d="M43 31H389V162H43ZM77 66H355V129H77Z" />
        {Array.from({ length: 12 }, (_, i) => <path key={i} className="exp-parking-line" d={`M${89 + i * 22} 32v29m0 72v27`} />)}
        <path className="exp-map-route" d="M60 99V49H372V146H60V99" />
        <g className="exp-map-ticks"><path d="M26 20v5M26 170v8M407 20v5M407 170v8M26 23h6M401 23h6M26 176h6M401 176h6" /><text x="192" y="187">MAP / 01</text></g>
        {landmarks.map((landmark) => <g key={landmark.short} className={nearby.short === landmark.short && candidates < 5 ? 'exp-landmark exp-landmark-found' : 'exp-landmark'}>
          <rect x={landmark.x - 4} y={landmark.y - 4} width="8" height="8" />
          <text x={landmark.x + 10} y={landmark.y + 4}>{landmark.short}</text>
        </g>)}
        {candidates < 5 && <motion.path className="exp-evidence-line" d={`M${position.x} ${position.y}L${nearby.x} ${nearby.y}`} initial={false} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .2 }} />}
        <motion.g animate={{ x: position.x, y: position.y }} transition={reduced ? { duration: 0 } : spring}>
          <circle className="exp-observation-glass" r="29" style={{ fill: `url(#${gridId}-lens)` }} />
          <path className="exp-lens-highlight" d="M-23-8A25 25 0 0 1-4-25" />
          <path className="exp-observation-cross" d="M-37 0h12M25 0h12M0-37v12M0 25v12" />
          <rect x="-3" y="-3" width="6" height="6" className="exp-position-pixel" />
        </motion.g>
      </svg>
      <span className="exp-map-coordinates">{position.x.toFixed(0).padStart(3, '0')} / {position.y.toFixed(0).padStart(3, '0')}</span>
    </div>
    <div className="exp-controls">
      <div className="exp-result" aria-live="polite"><span className="exp-quiet">{candidates === 5 ? '相似走廊' : nearby.label}</span><strong>{String(candidates).padStart(2, '0')} <small>个候选</small></strong></div>
      <div className="exp-direction-pad" aria-label="移动观察窗口">
        <button aria-label="向左移动" onClick={() => move(-18, 0)}><ArrowLeft size={16} /></button>
        <div><button aria-label="向上移动" onClick={() => move(0, -14)}><ArrowUp size={16} /></button><button aria-label="向下移动" onClick={() => move(0, 14)}><ArrowDown size={16} /></button></div>
        <button aria-label="向右移动" onClick={() => move(18, 0)}><ArrowRight size={16} /></button>
      </div>
      <Reset onClick={() => setPosition({ x: 212, y: 101 })} />
    </div>
    <p className="exp-footnote">方向键 / 点按移动<span>地标示意 · 非实时推理</span></p>
  </div>;
}

type Query = '柱子' | '车位' | '不存在的目标';
function Glimpse({ energy, reduced }: SceneProps) {
  const [query, setQuery] = useState<Query>('柱子');
  const [reveal, setReveal] = useState(43);
  const clipId = useId().replace(/:/g, '');
  const present = query !== '不存在的目标';
  useEffect(() => energy(present ? reveal / 100 * .85 : .12), [energy, reveal, present]);
  const scrub = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setReveal(clamp((event.clientX - bounds.left) / bounds.width) * 100);
  };
  return <div className="exp-scene exp-glimpse">
    <div className="exp-query-controls" aria-label="选择感知目标">
      {(['柱子', '车位', '不存在的目标'] as const).map((choice) => <button key={choice} className={query === choice ? 'is-selected' : ''} aria-pressed={query === choice} onClick={() => setQuery(choice)}>{choice}</button>)}
    </div>
    <div className="exp-stage exp-scrub-stage" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); scrub(event); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) scrub(event); }} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
      <svg viewBox="0 0 430 177" role="img" aria-label={`${query}查询：${present ? '拖动分界线查看示例遮罩' : '目标不存在，输出为空遮罩'}`}>
        <defs><clipPath id={clipId}><rect width={reveal * 4.3} height="177" /></clipPath></defs>
        <path className="exp-garage-plane" d="M23 20H407L287 84H143Z" />
        <path className="exp-garage-floor" d="M23 157L143 84H287L407 157Z" />
        <g className="exp-garage-wire"><path d="M23 20V157L143 84V62M407 20V157L287 84V62M58 20L160 84M376 20L270 84M185 20L200 84M246 20L231 84" /><path d="M35 153L153 93M93 160L172 100M336 160L258 100M397 153L278 93M68 134H125M95 117H146M113 105H158M309 105H326M287 117H356M304 134H386" /></g>
        <g className="exp-pillar-base"><path d="M87 24L110 31V121L87 135ZM175 51L185 54V96L175 104ZM318 33L340 24V137L318 122Z" /></g>
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="430" height="177" className="exp-mask-background" />
          {query === '柱子' && <g className="exp-target-mask"><path d="M87 24L110 31V121L87 135ZM175 51L185 54V96L175 104ZM318 33L340 24V137L318 122Z" /></g>}
          {query === '车位' && <g className="exp-target-mask exp-slot-mask"><path d="M44 148L69 135H113L87 151ZM76 130L99 118H141L118 131ZM105 114L124 104H157L141 114ZM344 151L316 135H364L394 151ZM308 131L287 118H330L353 131ZM286 114L270 104H306L325 114Z" /></g>}
        </g>
        <motion.line className="exp-reveal-line" y1="8" y2="162" animate={{ x1: reveal * 4.3, x2: reveal * 4.3 }} transition={{ duration: reduced ? 0 : .08 }} />
        <rect x="23" y="170" width="384" height="3" fill={present ? 'var(--exp-moss)' : 'var(--exp-copper)'} />
      </svg>
      <span className="exp-image-caption">RGB / MASK</span>
      <span className="exp-reveal-handle" style={{ left: `${reveal}%` }} aria-hidden="true">↔</span>
    </div>
    <div className="exp-reveal-control"><span>显影</span><input type="range" min="0" max="100" value={reveal} aria-label="遮罩显影比例" onChange={(event) => setReveal(Number(event.target.value))} /><span>{reveal.toFixed(0)}%</span></div>
    <p className="exp-footnote"><span className={`exp-presence ${present ? 'is-present' : 'is-empty'}`} aria-live="polite">{present ? '目标存在 · 示例遮罩' : '目标不存在 · 空遮罩'}</span><span>预绘演示</span></p>
  </div>;
}

type ContextSlot = 'subject' | 'period' | 'unit';
const esgSlots: { id: ContextSlot; label: string; value: string; x: number; y: number }[] = [
  { id: 'subject', label: '主体', value: '演示企业 A', x: 292, y: 41 },
  { id: 'period', label: '期间', value: '2025', x: 326, y: 99 },
  { id: 'unit', label: '单位', value: 'MWh', x: 290, y: 158 },
];
function ESG({ energy, reduced }: SceneProps) {
  const [bound, setBound] = useState<ContextSlot[]>([]);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [boundaryConflict, setBoundaryConflict] = useState(false);
  const slotRefs = useRef<Partial<Record<ContextSlot, HTMLButtonElement | null>>>({});
  const bind = (slot: ContextSlot) => setBound((previous) => previous.includes(slot) ? previous : [...previous, slot]);
  useEffect(() => energy(bound.length / 3 * (boundaryConflict ? .38 : .88)), [bound.length, boundaryConflict, energy]);
  const drop = (point: { x: number; y: number }) => {
    const distances = esgSlots.map((slot) => {
      const rect = slotRefs.current[slot.id]?.getBoundingClientRect();
      return { id: slot.id, distance: rect ? Math.hypot(point.x - rect.left - rect.width / 2, point.y - rect.top - rect.height / 2) : Infinity };
    }).sort((a, b) => a.distance - b.distance);
    if (distances[0].distance < 76) bind(distances[0].id);
  };
  return <div className={`exp-scene exp-esg ${boundaryConflict ? 'has-boundary-conflict' : ''}`}>
    <div className="exp-stage exp-evidence-stage">
      <span className="exp-corner-label">演示数据 / 数据的身份</span>
      <svg viewBox="0 0 430 204" aria-hidden="true">
        <path className="exp-paper-outline" d="M41 58L163 45L171 155L48 165Z" /><path className="exp-paper-fold" d="M146 47L163 45L165 67Z" />
        {esgSlots.map((slot) => <motion.path key={slot.id} className={bound.includes(slot.id) ? 'exp-context-link is-bound' : 'exp-context-link'} d={`M141 103C202 103 216 ${slot.y} ${slot.x - 8} ${slot.y}`} initial={false} animate={{ pathLength: bound.includes(slot.id) ? 1 : 0, opacity: bound.includes(slot.id) ? 1 : .12 }} transition={{ duration: reduced ? 0 : .4 }} />)}
        {boundaryConflict && <g className="exp-boundary-seam"><path d="M225 49L231 86L226 108L234 135L230 166L238 166L241 134L233 107L237 86L232 49Z" /><path d="M224 49L230 86L225 108L233 135L229 166M239 62L244 86L240 108L247 135" /></g>}
        {sourceOpen && <path className="exp-source-link" d="M103 126V191H273" />}
      </svg>
      <motion.button className="exp-number" drag dragMomentum={false} dragSnapToOrigin dragElastic={.1} animate={{ rotate: boundaryConflict ? -2 : 0, y: boundaryConflict ? -3 : 0 }} transition={reduced ? { duration: 0 } : spring} onDragEnd={(_event, info) => drop(info.point)} whileDrag={reduced ? {} : { scale: 1.06, rotate: -4 }} aria-label="124.8。拖动到主体、期间或单位；也可以点按右侧标签完成关联。" onClick={() => setSourceOpen(true)}>
        <span className="exp-quiet">原始数值</span><strong>124<span>.8</span></strong><small>拖动关联 ↗</small>
      </motion.button>
      {esgSlots.map((slot) => <button key={slot.id} ref={(node) => { slotRefs.current[slot.id] = node; }} style={{ left: `${slot.x / 430 * 100}%`, top: `${slot.y / 204 * 100}%` }} className={`exp-context-slot ${bound.includes(slot.id) ? 'is-bound' : ''}`} onClick={() => bind(slot.id)} aria-label={`关联${slot.label}：${slot.value}`} aria-pressed={bound.includes(slot.id)}>
        <span>{slot.label}{bound.includes(slot.id) && <Check size={11} />}</span><strong>{bound.includes(slot.id) ? slot.value : '等待关联'}</strong>
      </button>)}
      {sourceOpen && <div className="exp-source-excerpt"><span>演示原表 · 第 08 页</span><strong>能源使用　124.8 MWh</strong></div>}
    </div>
    <div className="exp-controls exp-evidence-controls">
      <button className="exp-text-button" onClick={() => setSourceOpen((open) => !open)} aria-expanded={sourceOpen}><Link2 size={13} />{sourceOpen ? '收起原表' : '回溯演示原表'}</button>
      <button className={`exp-boundary-toggle ${boundaryConflict ? 'is-active' : ''}`} aria-pressed={boundaryConflict} onClick={() => setBoundaryConflict((conflicting) => !conflicting)}>边界冲突<span aria-hidden="true">{boundaryConflict ? 'ON' : 'OFF'}</span></button>
      <span className="exp-binding-count" aria-live="polite">{bound.length}/3 <span>项语境</span></span>
      <Reset onClick={() => { setBound([]); setSourceOpen(false); setBoundaryConflict(false); }} />
    </div>
    <p className="exp-footnote exp-boundary-status" aria-live="polite">{boundaryConflict ? '集团范围 ≠ 单体范围 · 暂不能比较' : bound.length === 3 ? '语境已关联 · 统计口径仍需核对' : '拖动数字 / 点按关联'}<span>演示口径</span></p>
  </div>;
}

type ControlFrame = { request: number; output: number; temperature: number; limited: boolean };
function Mask({ energy, reduced }: SceneProps) {
  const materialId = useId().replace(/:/g, '');
  const [frame, setFrame] = useState<ControlFrame>({ request: 0, output: 0, temperature: 36, limited: false });
  const [close, setClose] = useState(false);
  const [hot, setHot] = useState(false);
  const engine = useRef({ request: 0, output: 0, temperature: 36, held: false, close: false, hot: false, thermalLimited: false });
  const raf = useRef<number | null>(null);
  const previousTime = useRef(0);
  const lastPaint = useRef(0);
  const tick = useRef<(time: number) => void>(() => undefined);
  tick.current = (time) => {
    const state = engine.current;
    const delta = Math.min((time - previousTime.current) / 1000, .05);
    previousTime.current = time;
    state.request = clamp(state.request + (state.held ? .64 : -.36) * delta);
    const targetTemperature = state.hot ? 43 : 36 + state.output * 6;
    state.temperature += (targetTemperature - state.temperature) * (1 - Math.exp(-delta * .7));
    if (state.temperature > 40.2) state.thermalLimited = true;
    else if (state.temperature < 38.8) state.thermalLimited = false;
    const limit = Math.min(state.close ? .22 : .72, state.thermalLimited ? .42 : .72);
    state.output += (Math.min(state.request, limit) - state.output) * (1 - Math.exp(-delta * 8));
    const limited = state.request > limit + .025;
    if (time - lastPaint.current > 30) {
      setFrame({ request: state.request, output: state.output, temperature: state.temperature, limited });
      energy(clamp(state.request * .2 + state.output * .8));
      lastPaint.current = time;
    }
    if (state.held || state.request > .003 || state.output > .003 || Math.abs(targetTemperature - state.temperature) > .03) {
      raf.current = requestAnimationFrame((next) => tick.current(next));
    } else {
      state.request = 0; state.output = 0;
      setFrame({ request: 0, output: 0, temperature: state.temperature, limited: false });
      energy(0); raf.current = null;
    }
  };
  const start = () => { if (raf.current === null) { previousTime.current = performance.now(); raf.current = requestAnimationFrame((time) => tick.current(time)); } };
  const hold = () => { engine.current.held = true; start(); };
  const release = () => { engine.current.held = false; };
  const pulse = () => { engine.current.request = clamp(engine.current.request + .21); start(); };
  useEffect(() => () => { if (raf.current !== null) cancelAnimationFrame(raf.current); energy(0); }, [energy]);
  return <div className={`exp-scene exp-mask ${frame.limited ? 'is-limited' : ''}`}>
    <div className="exp-stage exp-mask-stage">
      <svg viewBox="0 0 430 183" aria-hidden="true">
        <defs><linearGradient id={materialId} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b9aed6" stopOpacity=".13" /><stop offset=".45" stopColor="#ece8df" stopOpacity=".025" /><stop offset="1" stopColor="#b9aed6" stopOpacity=".08" /></linearGradient></defs>
        <path className="exp-mask-contour" d="M143 39Q216 10 287 39L300 112Q279 154 215 157Q151 154 130 112Z" style={{ fill: `url(#${materialId})` }} />
        <path className="exp-mask-highlight" d="M153 34Q216 17 276 35M136 114Q148 137 176 145" />
        <path className="exp-mask-eye" d="M150 65Q170 52 188 66L189 84Q169 93 151 82ZM240 66Q259 52 279 65L278 82Q260 93 240 84Z" />
        <path className="exp-mask-nose" d="M211 71L207 103H223L219 71" />
        <path className="exp-mask-mouth" d="M183 124Q215 111 247 124" />
        {Array.from({ length: 15 }, (_, index) => {
          const angle = (index / 14 * 260 - 220) * Math.PI / 180;
          const x = 215 + Math.cos(angle) * 93, y = 91 + Math.sin(angle) * 81;
          return <rect key={index} className={`exp-led ${index / 15 < frame.output ? 'is-lit' : ''}`} x={x - 2.5} y={y - 2.5} width="5" height="5" />;
        })}
        <motion.circle className="exp-output-halo" cx="215" cy="92" r="61" animate={{ opacity: frame.output * .65, scale: 1 + frame.output * .1 }} transition={{ duration: reduced ? 0 : .12 }} />
        <path className="exp-feedback-route" d="M299 112H356V36H287M130 112H73V158H178" />
        <rect x="352" y="108" width="8" height="8" className="exp-feedback-pixel" />
        <text x="328" y="25" className="exp-svg-small">反馈</text>
      </svg>
      <span className="exp-thermal">{frame.temperature.toFixed(1)}°<small>温度示意</small></span>
      <span className="exp-distance">{close ? '05' : '14'}<small>cm / 距离示意</small></span>
      <span className="exp-limit-state" aria-live="polite">{frame.limited ? '输出已限幅' : frame.output > .02 ? '反馈恢复中' : '等待一次轻触'}</span>
    </div>
    <div className="exp-control-bars"><div><span>请求</span><i><motion.b animate={{ scaleX: frame.request }} transition={{ duration: 0 }} /></i><strong>{(frame.request * 100).toFixed(0)}</strong></div><div><span>输出</span><i><motion.b animate={{ scaleX: frame.output }} transition={{ duration: 0 }} /></i><strong>{(frame.output * 100).toFixed(0)}</strong></div></div>
    <div className="exp-mask-controls">
      <button className="exp-charge-button" onClick={pulse} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); hold(); }} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onKeyDown={(event) => { if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) hold(); }} onKeyUp={(event) => { if (event.key === ' ' || event.key === 'Enter') release(); }} onBlur={release}>轻点 / 按住蓄能</button>
      <button className={close ? 'is-active' : ''} aria-pressed={close} onClick={() => { engine.current.close = !close; setClose(!close); start(); }}>距离偏近</button>
      <button className={hot ? 'is-active' : ''} aria-pressed={hot} onClick={() => { engine.current.hot = !hot; setHot(!hot); start(); }}>升温</button>
    </div>
    <p className="exp-footnote">模拟控制参数<span>演示阈值 · 非治疗方案</span></p>
  </div>;
}

function SUPS({ energy, reduced }: SceneProps) {
  const roofId = useId().replace(/:/g, '');
  const [roof, setRoof] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  useEffect(() => energy(direction === 'right' ? .7 : roof ? .38 : .18), [direction, roof, energy]);
  return <div className="exp-scene exp-sups">
    <div className="exp-stage exp-simulation-stage">
      <span className="exp-corner-label">语义 × 几何 / 场景示意</span>
      <svg viewBox="0 0 430 206" role="img" aria-label={`A区位于左侧，标识指向${direction === 'left' ? '左' : '右'}侧，${direction === 'left' ? '语义一致' : '存在冲突'}。屋顶${roof ? '已显示' : '已隐藏'}`}>
        <defs><linearGradient id={roofId} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b9aed6" stopOpacity=".34" /><stop offset=".5" stopColor="#ece8df" stopOpacity=".035" /><stop offset="1" stopColor="#b9aed6" stopOpacity=".14" /></linearGradient></defs>
        <path className="exp-sim-ground" d="M32 147L196 91L400 149L232 204Z" />
        <g className="exp-sim-grid"><path d="M78 131L279 186M124 116L327 172M168 102L372 157M81 161L247 105M131 176L300 120M182 190L351 135" /></g>
        <path className="exp-sim-wall" d="M32 147V70L196 15V91ZM196 15L400 72V149L196 91" />
        <motion.path className="exp-sim-roof" d="M32 70L196 15L400 72L233 127Z" style={{ fill: `url(#${roofId})` }} animate={{ opacity: roof ? .9 : 0, y: roof ? -9 : -30 }} transition={reduced ? { duration: 0 } : spring} />
        <g className="exp-sim-pixels"><rect x="90" y="116" width="8" height="18" /><rect x="150" y="96" width="7" height="18" /><rect x="326" y="123" width="8" height="20" /></g>
        <text x="119" y="157" className="exp-zone-label">A</text><text x="293" y="164" className="exp-zone-label">B</text>
        <g className={`exp-sign ${direction === 'right' ? 'is-conflicting' : ''}`}><rect x="193" y="65" width="65" height="25" rx="2" /><text x="206" y="82">A</text><motion.path d="M238 74L228 78L238 82M228 78H247" animate={{ rotate: direction === 'left' ? 0 : 180 }} style={{ transformOrigin: '238px 78px' }} transition={{ duration: reduced ? 0 : .22 }} /></g>
      </svg>
    </div>
    <div className="exp-layer-controls"><button className={roof ? 'is-selected' : ''} aria-pressed={roof} onClick={() => setRoof(!roof)}>屋顶层 {roof ? 'ON' : 'OFF'}</button><button onClick={() => setDirection(direction === 'left' ? 'right' : 'left')}>转向标识 <ArrowRight size={13} /></button></div>
    <p className={`exp-footnote exp-sim-status ${direction === 'right' ? 'is-conflicting' : ''}`} aria-live="polite">{direction === 'left' ? 'A 区在左侧 · 标识与空间一致' : 'A 区在左侧 · 箭头却向右：冲突被保留'}</p>
  </div>;
}

function AVPC({ energy, reduced }: SceneProps) {
  const [shared, setShared] = useState({ vehicle: false, roadside: false });
  const sharedRef = useRef<HTMLDivElement>(null);
  const conflict = shared.vehicle && shared.roadside;
  const share = (source: keyof typeof shared) => setShared((previous) => ({ ...previous, [source]: !previous[source] }));
  const drop = (source: keyof typeof shared, point: { x: number; y: number }) => {
    const bounds = sharedRef.current?.getBoundingClientRect();
    if (bounds && Math.hypot(point.x - bounds.left - bounds.width / 2, point.y - bounds.top - bounds.height / 2) < 90) setShared((previous) => ({ ...previous, [source]: true }));
  };
  useEffect(() => energy(conflict ? .8 : shared.vehicle || shared.roadside ? .42 : .1), [shared.vehicle, shared.roadside, conflict, energy]);
  return <div className="exp-scene exp-avpc">
    <div className="exp-stage exp-sharing-stage">
      <span className="exp-corner-label">共享观察 / 预设样例</span>
      <svg viewBox="0 0 430 210" aria-hidden="true"><path className="exp-shared-orbit" d="M113 150Q213 0 320 150M111 56Q215 216 321 56" /><motion.path className="exp-observation-link" d="M87 86L207 133" initial={false} animate={{ opacity: shared.vehicle ? 1 : .12 }} transition={{ duration: reduced ? 0 : .2 }} /><motion.path className="exp-observation-link exp-observation-link-copper" d="M341 85L222 133" initial={false} animate={{ opacity: shared.roadside ? 1 : .12 }} transition={{ duration: reduced ? 0 : .2 }} /></svg>
      <div ref={sharedRef} className={`exp-shared-core ${conflict ? 'is-conflicting' : ''}`}><span>A 区</span><strong>{conflict ? '冲突' : shared.vehicle ? '空闲' : shared.roadside ? '占用' : '未知'}</strong><small>{Number(shared.vehicle) + Number(shared.roadside)} 条来源</small></div>
      <motion.button className={`exp-observer exp-observer-vehicle ${shared.vehicle ? 'is-shared' : ''}`} drag dragMomentum={false} dragSnapToOrigin onDragEnd={(_event, info) => drop('vehicle', info.point)} animate={{ x: shared.vehicle ? 24 : 0, y: shared.vehicle ? 10 : 0 }} transition={reduced ? { duration: 0 } : spring} onClick={() => share('vehicle')} aria-pressed={shared.vehicle} aria-label={`${shared.vehicle ? '撤回' : '共享'}车辆观察：A区空闲。可点按或拖动到中央。`}><span>车辆视野</span><strong>A 区空闲</strong><small>{shared.vehicle ? '观察已共享' : '拖近 / 点按共享'}</small></motion.button>
      <motion.button className={`exp-observer exp-observer-roadside ${shared.roadside ? 'is-shared' : ''}`} drag dragMomentum={false} dragSnapToOrigin onDragEnd={(_event, info) => drop('roadside', info.point)} animate={{ x: shared.roadside ? -24 : 0, y: shared.roadside ? 10 : 0 }} transition={reduced ? { duration: 0 } : spring} onClick={() => share('roadside')} aria-pressed={shared.roadside} aria-label={`${shared.roadside ? '撤回' : '共享'}路侧观察：A区占用。可点按或拖动到中央。`}><span>路侧视野</span><strong>A 区占用</strong><small>{shared.roadside ? '观察已共享' : '拖近 / 点按共享'}</small></motion.button>
    </div>
    <div className="exp-controls exp-sharing-controls"><p aria-live="polite">{conflict ? '两条相反观察均保留，未生成一致结论。' : shared.vehicle || shared.roadside ? '一条观察是一条来源，不是共同结论。' : '把两种视角带近，看看它们是否一致。'}</p><Reset onClick={() => setShared({ vehicle: false, roadside: false })} /></div>
    <p className="exp-footnote">协同感知概念示意<span>研究中</span></p>
  </div>;
}

const scenes: Record<ExperimentId, typeof Cosmos> = { cosmos: Cosmos, glimpse: Glimpse, esg: ESG, mask: Mask, sups: SUPS, avpc: AVPC };
export default function ExperimentPanel({ projectId, onEnergy, onFocusChange, reducedMotion }: ExperimentPanelProps) {
  const systemReduced = useReducedMotion();
  const reduced = Boolean(reducedMotion || systemReduced);
  const onEnergyRef = useRef(onEnergy);
  const onFocusRef = useRef(onFocusChange);
  onEnergyRef.current = onEnergy;
  onFocusRef.current = onFocusChange;
  const energy = useCallback((value: number) => onEnergyRef.current(clamp(Number.isFinite(value) ? value : 0)), []);
  const id = Object.prototype.hasOwnProperty.call(scenes, projectId) ? projectId as ExperimentId : 'cosmos';
  const Scene = scenes[id];
  useEffect(() => () => { energy(0); onFocusRef.current?.(false); }, [id, energy]);
  return <div className={`experiment-panel experiment-panel-${id}${reduced ? ' exp-reduced-motion' : ''}`} onFocusCapture={() => onFocusRef.current?.(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onFocusRef.current?.(false); }} onPointerDown={() => onFocusRef.current?.(true)} onPointerUp={(event) => { if (!event.currentTarget.contains(document.activeElement)) onFocusRef.current?.(false); }} onPointerCancel={() => onFocusRef.current?.(false)}>
    <Scene key={id} energy={energy} reduced={reduced} />
  </div>;
}
