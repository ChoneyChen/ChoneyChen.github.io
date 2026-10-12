import { motion } from "motion/react";
import { slowMotion } from "../lib/motionTiming";

const themes: Record<string, [string, string, string]> = {
  programming: ["#fbefd2", "#d3b77e", "#986b38"],
  vision: ["#f0eafa", "#c8b5e4", "#7d5cad"],
  systems: ["#e9f2df", "#acc1a5", "#48715a"],
  documents: ["#e5f0ee", "#a5beb9", "#42756d"],
};

/** Enamel-style symbols; Qwen glyph adapted from QwenLM/qwen-code (Apache-2.0). */
export function TechnicalSymbol({ kind, ready, selected, reduced, index }: {
  kind: string; ready: boolean; selected: boolean; reduced: boolean; index: number;
}) {
  const [light, shade, ink] = themes[kind] ?? themes.documents;
  const gradient = `technical-enamel-${kind}`;
  return <svg viewBox="0 0 180 180" aria-hidden="true" className={`technical-symbol technical-symbol-${kind}`}>
    <defs><linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1"><stop stopColor={light}/><stop offset="1" stopColor={shade}/></linearGradient></defs>
    <motion.g initial={false} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 24 }} transition={slowMotion({ duration: reduced ? 0 : .5, delay: reduced || !ready ? 0 : index * .06, ease: [.22,1,.36,1] })}>
      <rect x="18" y="26" width="144" height="140" rx="32" fill={ink} opacity=".18"/>
      <rect x="18" y="16" width="144" height="144" rx="32" fill={`url(#${gradient})`} stroke={ink} strokeWidth={selected ? 3 : 1.4}/>
      <rect x="25" y="23" width="130" height="130" rx="27" fill="none" stroke="#ffffff" strokeOpacity=".7"/>
      <path d="M40 31H119Q146 31 146 58" stroke="#ffffff" strokeWidth="3" strokeOpacity=".55" fill="none"/>
      <motion.g initial={false} animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : .8 }} style={{ transformOrigin: "90px 90px" }} transition={slowMotion({ duration: reduced ? 0 : .5, delay: reduced || !ready ? 0 : .12 + index * .06 })}>
        {kind === "programming" ? <>
          <path d="M86 44C65 44 61 51 61 65V76H92V84H57C42 84 36 94 36 111C36 127 46 137 61 137H72V121C72 107 84 101 99 101H118C134 101 144 94 144 79V64C144 50 133 44 116 44Z" fill="#326e9b"/>
          <path d="M86 44C65 44 61 51 61 65V76H92V84H57C42 84 36 94 36 111C36 127 46 137 61 137H72V121C72 107 84 101 99 101H118C134 101 144 94 144 79V64C144 50 133 44 116 44Z" transform="rotate(180 90 90)" fill="#e8bd4d"/>
          <circle cx="73" cy="56" r="4" fill="#fff5dc"/><circle cx="107" cy="124" r="4" fill="#fff5dc"/>
        </> : kind === "vision" ? <g className="technical-qwen-mark">
          <path d="m140.93 85-16.35-28.33-1.93-3.34 8.66-15a3.323 3.323 0 0 0 0-3.34l-9.62-16.67c-.3-.51-.72-.93-1.22-1.22s-1.07-.45-1.67-.45H82.23l-8.66-15a3.33 3.33 0 0 0-2.89-1.67H51.43c-.59 0-1.17.16-1.66.45-.5.29-.92.71-1.22 1.22L32.19 29.98l-1.92 3.33H12.96c-.59 0-1.17.16-1.66.45-.5.29-.93.71-1.22 1.22L.45 51.66a3.323 3.323 0 0 0 0 3.34l18.28 31.67-8.66 15a3.32 3.32 0 0 0 0 3.34l9.62 16.67c.3.51.72.93 1.22 1.22s1.07.45 1.67.45h36.56l8.66 15a3.35 3.35 0 0 0 2.89 1.67h19.25a3.34 3.34 0 0 0 2.89-1.67l18.28-31.67h17.32c.6 0 1.17-.16 1.67-.45s.92-.71 1.22-1.22l9.62-16.67a3.323 3.323 0 0 0 0-3.34ZM51.44 3.33 61.07 20l-9.63 16.66h76.98l-9.62 16.66H45.67l-11.54-20zM57.21 120H22.58l9.63-16.67h19.25l-38.5-66.67h19.25l9.62 16.67L68.78 100l-11.55 20Zm61.59-33.34-9.62-16.67-38.49 66.67-9.63-16.67 9.63-16.66 26.94-46.67h23.1l17.32 30z" transform="translate(40 40) scale(.71)" fill="#7955b0"/>
        </g> : kind === "systems" ? <>
          {[0,1,2,3].map(i => <g key={i} stroke="#63896c" strokeWidth="5" strokeLinecap="round"><path d={`M${65+i*16} 39V55M${65+i*16} 124V140M39 ${65+i*16}H55M124 ${65+i*16}H140`}/></g>)}
          <rect x="54" y="54" width="72" height="72" rx="13" fill="#315e4f" stroke="#b9d6b8" strokeWidth="3"/>
          <rect x="67" y="67" width="46" height="46" rx="7" fill="#6b9575"/>
          <path d="M78 77H101V100H78Z M83 72V67M96 72V67M83 105V112M96 105V112" stroke="#ebf4ce" strokeWidth="3" fill="none"/>
          <circle cx="119" cy="61" r="3" fill="#e5be70"/>
        </> : <>
          <path d="M54 42H106L128 64V137H54Z" fill="#f6f3dd" stroke="#47776e" strokeWidth="2"/>
          <path d="M106 42V64H128" fill="#bdd4c8" stroke="#47776e" strokeWidth="2"/>
          <text x="65" y="93" fontSize="23" fontWeight="600" fill="#396960" fontFamily="Space Grotesk, sans-serif">OCR</text>
          <path d="M65 108H115M65 119H99" stroke="#8ca69b" strokeWidth="3"/>
          <motion.path d="M45 61V38H67M113 38H137V61M137 117V143H114M65 143H45V117" stroke="#396960" strokeWidth="3" fill="none" animate={{ pathLength: ready ? 1 : 0 }} transition={slowMotion({ duration: reduced ? 0 : .6, delay: reduced || !ready ? 0 : .22 })}/>
        </>}
      </motion.g>
    </motion.g>
  </svg>;
}
