import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { slowMotion, presentationBlend } from "../lib/motionTiming";
import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { MoveHorizontal, RotateCcw, RotateCw } from "lucide-react";
import { useI18n } from "../i18n";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import "./glimpse-perception.css";

const region = (u: number, v: number) => {
  if (v < .34) return 0;
  if ((u > .12 && u < .2 || u > .76 && u < .83) && v < .82) return 1;
  if (u > .32 && u < .66 && v > .51 && v < .79) return 2;
  return 3;
};
type Presence = "present" | "absent" | "uncertain";
const palette = ["#b7c6e9", "#587aca", "#dca385", "#d3d6df"];
const semantics = ["#bbbef4", "#476bed", "#ed9b77", "#b3d598"];

const PerceptionImage = memo(function PerceptionImage({ mode, presence = "present" }: { mode: "rgb" | "semantic" | "depth" | "normal" | "fusion"; presence?: Presence }) {
  const depth = mode === "depth";
  const colors = depth ? ["#242651", "#6755ae", "#df956e", "#eadbb0"] : mode === "normal" ? ["#86d4ba", "#a98fd8", "#e6b1bc", "#8dd7df"] : mode === "semantic" ? semantics : palette;
  return <svg viewBox="0 0 320 200" aria-hidden="true" className={`gp-image gp-image-${mode}`}>
    <defs><linearGradient id={`gp-floor-${mode}`} x2="0" y2="1"><stop stopColor={colors[0]}/><stop offset="1" stopColor={colors[3]}/></linearGradient></defs>
    <rect width="320" height="200" rx="6" fill={colors[0]}/>
    <path d="M0 64H320V200H0Z" fill={`url(#gp-floor-${mode})`}/>
    <path d="M0 65L160 49L320 65M0 21L160 49L320 20M105 0L160 49L213 0" fill="none" stroke={depth ? "#ddd2fa" : "#42558a"} opacity=".35"/>
    <path d="M39 50H64V161L39 169ZM243 50H266V164L243 157Z" fill={colors[1]}/>
    <path d="M112 111L128 101H192L210 116V157H107Z" fill={colors[2]}/>
    <path d="M126 106H190L199 124H118Z" fill={depth ? "#f1bc83" : "#d9e3f1"}/>
    <path d="M107 142H210M160 166V200M37 177L106 142M282 179L214 142" stroke={depth ? "#faf1d8" : "#f5f3e9"} fill="none" strokeWidth="2"/>
    <circle cx="121" cy="158" r="8" fill={depth ? "#df956e" : "#344464"}/><circle cx="196" cy="158" r="8" fill={depth ? "#df956e" : "#344464"}/>
    {mode === "semantic" && <g><rect width="305" height="200" fill="#26304e"/>{presence === "present" && <path d="M39 50H64V161L39 169ZM243 50H266V164L243 157Z" fill="#ddf5ef"/>}{presence === "uncertain" && <path d="M39 50H64V161L39 169Z" fill="#8290a6"/>}<rect x="305" width="15" height="200" fill={presence === "present" ? "#37ad75" : presence === "absent" ? "#c95054" : "#778097"}/></g>}
    {mode === "fusion" && <g fill="none" strokeWidth="1.4"><path d="M39 50H64V161L39 169ZM243 50H266V164L243 157Z" stroke="#476bed"/><path d="M112 111L128 101H192L210 116V157H107Z" stroke="#e98956"/><path d="M0 86H320M0 115H320M0 160H320" stroke="#c5edb5" opacity=".65"/></g>}
  </svg>;
});

function SpatialPreview({ lift, dragging, visible, quiet, presence }: { lift: number; dragging: boolean; visible: boolean; quiet: boolean; presence: Presence }) {
  const { t } = useI18n();
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<{ draw: () => void; rotate: (x: number, y?: number) => void; reset: () => void; rearm: () => void } | null>(null);
  const current = useRef({ lift, dragging, visible, quiet, presence });
  current.current = { lift, dragging, visible, quiet, presence };
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import("three").then(THREE => {
      if (disposed || !canvas.current) return;
      const node = canvas.current;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ canvas: node, alpha: true, antialias: true }); }
      catch { setFallback(true); return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, .1, 30);
      camera.position.set(0, 0, 6.7);
      const group = new THREE.Group(); scene.add(group);
      const positions: number[] = [], lifted: number[] = [], targets: number[] = [], colors: number[] = [];
      const color = new THREE.Color();
      for (let y = 0; y < 60; y++) for (let x = 0; x < 96; x++) {
        const u = x / 95, v = y / 59, area = region(u, v);
        positions.push((u - .5) * 4.8, (.5 - v) * 3, 0);
        const depth = area === 2 ? 2.4 : area === 1 ? 3.2 : area === 0 ? 5.1 : 5.1 - (v - .34) * 3.1;
        // Illustrative pinhole lifting: p = d K^-1 [u, v, 1]^T.
        lifted.push((u - .5) * depth * 1.1, (.5 - v) * depth * .86, 3.5 - depth);
        targets.push(area === 1 ? 1 : 0);
        color.set(area === 1 ? semantics[1] : palette[area]); colors.push(color.r, color.g, color.b);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("liftedPosition", new THREE.Float32BufferAttribute(lifted, 3));
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute("queryTarget", new THREE.Float32BufferAttribute(targets, 1));
      const material = new THREE.ShaderMaterial({ transparent: true, vertexColors: true, uniforms: { lift: { value: 0 }, presence: { value: 1 }, pixelRatio: { value: renderer.getPixelRatio() } },
        vertexShader: `attribute vec3 liftedPosition; attribute float queryTarget; uniform float presence; uniform float lift; uniform float pixelRatio; varying vec3 shade; void main(){shade=mix(color,vec3(.62,.68,.78),queryTarget*(1.-presence));vec3 p=mix(position,liftedPosition,lift);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=3.4*pixelRatio;}`,
        fragmentShader: `varying vec3 shade; void main(){if(length(gl_PointCoord-.5)>.48)discard;gl_FragColor=vec4(shade,.95);}` });
      group.add(new THREE.Points(geometry, material));
      const grid = new THREE.GridHelper(5.3, 12, 0x859ecb, 0xb6c6df); grid.rotation.x = Math.PI / 2; grid.position.z = -1.05; group.add(grid);
      group.rotation.set(-.12, -.25, 0);
      let raf = 0, lastTime = 0, yaw = -.25, pitch = -.12, rendered = false, dragging: { id: number; x: number; y: number } | null = null;
      const render = (time: number) => {
        raf = 0;
        if (disposed || !current.current.visible) { lastTime = 0; return; }
        const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 1 / 60;
        lastTime = time;
        const goal = current.current.lift;
        material.uniforms.presence.value = current.current.presence === "present" ? 1 : current.current.presence === "absent" ? 0 : .3;
        material.uniforms.lift.value = current.current.quiet || current.current.dragging ? goal : THREE.MathUtils.lerp(material.uniforms.lift.value, goal, presentationBlend(.085, delta));
        group.rotation.y = current.current.quiet || dragging ? yaw : THREE.MathUtils.lerp(group.rotation.y, yaw, presentationBlend(.15, delta));
        group.rotation.x = current.current.quiet || dragging ? pitch : THREE.MathUtils.lerp(group.rotation.x, pitch, presentationBlend(.15, delta));
        renderer.render(scene, camera);
        if (!rendered) { rendered = true; setReady(true); }
        node.dataset.rotation = `${group.rotation.x.toFixed(3)},${group.rotation.y.toFixed(3)}`;
        node.dataset.depthLift = String(material.uniforms.lift.value.toFixed(3));
        if (Math.abs(material.uniforms.lift.value - goal) > .002 || Math.abs(group.rotation.y - yaw) > .001 || Math.abs(group.rotation.x - pitch) > .001) raf = requestAnimationFrame(render);
        else lastTime = 0;
      };
      const schedule = () => { if (!raf) { lastTime = 0; raf = requestAnimationFrame(render); } };
      engine.current = { draw: schedule, rotate: (x, y = 0) => { yaw = THREE.MathUtils.clamp(yaw + x, -1.25, 1.25); pitch = THREE.MathUtils.clamp(pitch + y, -.7, .7); if (dragging) group.rotation.set(pitch, yaw, 0); schedule(); }, reset: () => { yaw = -.25; pitch = -.12; schedule(); }, rearm: () => { yaw = -.25; pitch = -.12; dragging = null; group.rotation.set(pitch, yaw, 0); material.uniforms.lift.value = 0; } };
      const resize = () => { const b = node.getBoundingClientRect(); renderer.setSize(Math.max(1,b.width),Math.max(1,b.height),false); camera.aspect = b.width / Math.max(1,b.height); camera.updateProjectionMatrix(); schedule(); };
      const observer = new ResizeObserver(resize); observer.observe(node); resize();
      const down = (event: PointerEvent) => { if (event.button !== 0) return; node.focus({preventScroll:true}); node.setPointerCapture(event.pointerId); dragging = {id:event.pointerId,x:event.clientX,y:event.clientY}; };
      const move = (event: PointerEvent) => { if (!dragging || event.pointerId !== dragging.id) return; engine.current?.rotate((event.clientX-dragging.x)*.006,(event.clientY-dragging.y)*.004); dragging.x=event.clientX;dragging.y=event.clientY; };
      const up = (event: PointerEvent) => { dragging=null; if(node.hasPointerCapture(event.pointerId))node.releasePointerCapture(event.pointerId); };
      node.addEventListener("pointerdown",down);node.addEventListener("pointermove",move);node.addEventListener("pointerup",up);node.addEventListener("pointercancel",up);
      const lost = (event: Event) => { event.preventDefault(); setFallback(true); };
      node.addEventListener("webglcontextlost",lost);
      cleanup = () => { observer.disconnect(); cancelAnimationFrame(raf);node.removeEventListener("pointerdown",down);node.removeEventListener("pointermove",move);node.removeEventListener("pointerup",up);node.removeEventListener("pointercancel",up);node.removeEventListener("webglcontextlost",lost);geometry.dispose();material.dispose();grid.geometry.dispose();(grid.material as InstanceType<typeof THREE.Material>).dispose();renderer.dispose();engine.current=null; };
    }).catch(() => { if (!disposed) setFallback(true); });
    return () => { disposed=true;cleanup(); };
  }, []);
  useEffect(() => { engine.current?.draw(); }, [lift,dragging,visible,quiet,presence]);
  useEffect(() => { if (!visible || lift === 0) engine.current?.rearm(); }, [visible,lift]);
  return <div className="gp-space" data-ready={ready} data-lifted={lift>0}>
    {!fallback && <canvas ref={canvas} tabIndex={0} aria-label={t("语义深度空间预览：拖动旋转，方向键转动", "Semantic depth preview: drag to rotate, arrow keys to turn")} onKeyDown={event=>{ const direction=event.key==="ArrowRight"? .15:event.key==="ArrowLeft"?-.15:0;const vertical=event.key==="ArrowDown"?.1:event.key==="ArrowUp"?-.1:0;if(direction||vertical){event.preventDefault();engine.current?.rotate(direction,vertical);} }}/>}
    {(!ready || fallback) && <div className="gp-space-fallback"><PerceptionImage mode="fusion"/>{fallback && <p>{t("空间示意 · 你的浏览器显示二维预览", "Spatial concept · showing a 2D preview in this browser")}</p>}</div>}
    <div className="gp-orbit-controls"><span>{t("拖动旋转 · 方向键", "Drag to rotate · arrow keys")}</span><button onClick={()=>engine.current?.rotate(-.22)} aria-label={t("向左旋转空间", "Rotate space left")}><RotateCcw size={16}/></button><button onClick={()=>engine.current?.rotate(.22)} aria-label={t("向右旋转空间", "Rotate space right")}><RotateCw size={16}/></button><button onClick={()=>engine.current?.reset()}>{t("复位", "Reset view")}</button></div>
  </div>;
}

export function GlimpsePerception({ quiet = false }: { quiet?: boolean }) {
  const { t } = useI18n();
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 600px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [progress,setProgress] = useState(0);
  const [dragging,setDragging] = useState(false);
  const stage=progress<35?0:progress<65?1:2;
  const fusion=Math.min(1,progress/50);
  const lift=Math.max(0,(progress-50)/50);
  const smooth=(value:number)=>value*value*(3-2*value);
  const spaceOpacity=smooth(Math.min(1,lift*4));
  const fusionOpacity=smooth(Math.max(0,(fusion-.25)/.75))*(1-spaceOpacity);
  const [presence,setPresence] = useState<Presence>("present");
  const [mounted,setMounted] = useState(false);
  const host=useRef<HTMLDivElement>(null);
  const visible=useInView(host,{amount:.08});
  useCollapseOnLeave("glimpse",()=>{setProgress(0);setDragging(false);setPresence("present");});
  const labels=[t("三种任务输出", "Three task outputs"),t("语义几何融合", "Semantic-geometric fusion"),t("3D 抬升", "3D lifting")];
  const titles=[t("同一个生成模型，不同的任务指令。", "One generator, different task instructions."),t("像素对齐，将语义与几何关联。", "Pixel-aligned semantics and geometry."),t("用深度与相机模型，抬升为空间。", "Lift depth into space with a camera model.")];
  const states: Presence[]=["present","absent","uncertain"];
  const stateLabels=[t("存在", "Present"),t("不存在", "Absent"),t("不确定", "Uncertain")];
  const advance=(next:number)=>{setProgress(next);if(next>15)setMounted(true);};
  const sliderStyle={"--gp-progress": `${progress}%`} as CSSProperties;
  return <div className="gp-story" ref={host} data-stage={stage} data-progress={progress} data-reading-open={progress>0} aria-controls="glimpse-visual-stage" data-presence={presence} data-entry-state={quiet||visible?"present":"reset"}>
    <div className="gp-topline"><span>{t("U-IMPROVE / 生成式感知接口", "U-IMPROVE / GENERATIVE PERCEPTION INTERFACE")}</span><span>{t("方法交互示意", "INTERACTIVE METHOD CONCEPT")}</span></div>
    <h3>{titles[stage]}</h3>
    <div className="gp-input-story">
      <div className="gp-input-scene"><PerceptionImage mode="rgb"/><span>{t("RGB 输入", "RGB INPUT")}</span></div>
      <div className="gp-strip-story">
        <p><strong>Presence-Aware Metadata Strip</strong><span>{t("分割任务输出中的目标状态", "Target status in the segmentation output")}</span></p>
        <div role="group" aria-label={t("切换 Metadata Strip 的三态示例", "Switch the Metadata Strip state example")}>
          {states.map((state,index)=><button key={state} aria-pressed={presence===state} onClick={()=>setPresence(state)}><i className={`gp-status-dot gp-status-${state}`}/>{stateLabels[index]}</button>)}
        </div>
        <small className="gp-query-example">{presence === "present" ? t("示例指令：分割立柱。", "Example query: Segment the pillar.") : presence === "absent" ? t("示例指令：分割行人。", "Example query: Segment the pedestrian.") : t("示例指令：分割被遮挡的物体。", "Example query: Segment the occluded object.")}</small>
      </div>
    </div>
    <div className="gp-stage" id="glimpse-visual-stage">
      {(["semantic","depth","normal"] as const).map((mode,index)=><motion.div key={mode} className={`gp-view gp-view-${index}`} aria-hidden={stage !== 0} style={{left:narrow ? "0%" : `${index*33.333}%`}} animate={{x:narrow ? "0%" : `${(1-index)*100*fusion}%`,y:quiet||visible?([8,-8,8][index]*(1-fusion) + (narrow ? (1-index)*116*fusion : 0)):34,rotate:[-3,1,4][index]*(1-fusion),scale:1-lift*.18,opacity:quiet||visible?((1-fusion*(narrow ? 1 : .68))*(1-spaceOpacity)):0}} transition={slowMotion({duration:quiet||dragging?0:progress===0?.5:.15,delay:quiet||dragging||progress>0?0:index*.07,ease:[.22,1,.36,1]})}>
        <div className="gp-view-label"><span>0{index+1}</span><strong>{[t("分割输出", "Segmentation"),t("度量深度", "Metric depth"),t("表面法线", "Surface normals")][index]}</strong></div><PerceptionImage mode={mode} presence={presence}/><span className="gp-view-caption">{[t("RGB 遮罩编码 + 状态条", "RGB mask code + status strip"),t("颜色编码 → 距离", "Colour encoding to distance"),t("RGB 通道 → 法线方向", "RGB channels to normal direction")][index]}</span>
      </motion.div>)}
      <motion.div className="gp-fusion" animate={{opacity:quiet||visible?fusionOpacity:0,scale:.94+fusion*.06,y:-15*lift}} transition={slowMotion({duration:quiet||dragging?0:.15})} aria-hidden={stage!==1}><PerceptionImage mode="fusion"/><span>{t("确定性任务解码 · 语义与度量几何融合", "Deterministic decoding · semantic-geometric fusion")}</span></motion.div>
      {mounted && <motion.div className="gp-space-layer" animate={{opacity:spaceOpacity}} transition={slowMotion({duration:quiet||dragging?0:.15})} inert={progress<70}><SpatialPreview lift={lift} dragging={dragging} visible={visible} quiet={quiet} presence={presence}/></motion.div>}
    </div>
    <div className={`gp-journey${dragging?" is-dragging":""}`} style={sliderStyle}>
      <div className="gp-journey-label"><label htmlFor="glimpse-journey">{t("拖动，展开感知过程", "Drag through the perception process")}</label><MoveHorizontal size={18} aria-hidden="true"/></div>
      <div className="gp-journey-track">
        <input id="glimpse-journey" className="gp-journey-range" type="range" min="0" max="100" step="1" value={progress} aria-controls="glimpse-visual-stage" aria-valuetext={`${progress}% · ${labels[stage]}`} onChange={event=>advance(Number(event.target.value))} onPointerDown={()=>setDragging(true)} onPointerUp={()=>setDragging(false)} onPointerCancel={()=>setDragging(false)} onBlur={()=>setDragging(false)}/>
      </div>
      <div className="gp-journey-milestones" aria-hidden="true">{labels.map((label,index)=><span key={index} className={stage===index?"is-current":""}><small>0{index+1}</small>{label}</span>)}</div>
    </div>
    <p className="gp-context">{stage===2?t("抬升原理：p = d K⁻¹ [u, v, 1]ᵀ。使用示意深度与相机模型，未观测区域留空。", "Lifting: p = d K⁻¹ [u, v, 1]ᵀ. Illustrative depth and camera calibration; unobserved regions remain empty."):stage===1?t("像素对应的语义、度量深度与法线形成联合空间线索。", "Pixel-aligned semantics, metric depth and normals form joint spatial cues."):t("RGB 编码的任务图像经确定性解码，恢复对应感知结果。", "RGB task encodings decode deterministically into their perception outputs.")}</p>
    <p className="gp-demo-note">{t("方法示意 · 训练与定量评估待验证", "Method illustration · training and quantitative evaluation pending")}</p>

  </div>;
}
