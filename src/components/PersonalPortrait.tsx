import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight, Github, MoveUpRight, X } from "lucide-react";
import { useI18n } from "../i18n";
import "./personal-portrait.css";

interface PersonalPortraitProps {
  quiet?: boolean;
}

const getPersonalFacets = (t: (zh: string, en: string) => string) =>
  [
    {
      id: "space",
      index: "01",
      label: t("十堰 → 苏州", "Shiyan → Suzhou"),
      subtitle: t("家乡与现在", "Home and now"),
      title: t("家乡在十堰，日常在苏州。", "From Shiyan, based in Suzhou."),
      facts: [
        t("我的家乡是湖北十堰。", "My hometown is Shiyan, Hubei."),
        t("现在我常居江苏苏州。", "I am now based in Suzhou, Jiangsu."),
      ],
      question: t(
        "下一段学习与生活里，我想保留怎样的日常？",
        "What everyday routines do I want to make room for in the next stage of life and learning?",
      ),
      href: "#origins",
      link: t("回到我的来路", "Follow my journey"),
    },
    {
      id: "systems",
      index: "02",
      label: t("我的学习选择", "How I choose to learn"),
      subtitle: t("计算机与跨学科", "Computing and other fields"),
      title: t("从计算机工程，继续向外学。", "Start with computing, keep learning across fields."),
      facts: [
        t("我的学习结合了编程、数学和计算机系统。", "My studies bring together programming, mathematics and computer systems."),
        t("我的兴趣也延伸到人工智能、空间感知与环境数据科学。", "My interests also extend to AI, spatial perception and environmental data science."),
      ],
      question: t(
        "下一阶段的学习，怎样把工程能力与科学问题接起来？",
        "How can my next stage of learning connect engineering skills with scientific questions?",
      ),
      href: "#methods",
      link: t("看看我的工作方法", "Explore my working methods"),
    },
    {
      id: "environment",
      index: "03",
      label: t("长期愿景", "Long-term aspirations"),
      subtitle: t("计算与环境问题", "Computing for the environment"),
      title: t("把计算，带到更长期的环境问题。", "Bring computing to long-term environmental questions."),
      facts: [
        t("我希望进一步学习机器学习、科学计算和环境数据科学。", "I hope to deepen my knowledge of machine learning, scientific computing and environmental data science."),
        t("长期来看，我希望把 AI 与数据科学用于环境管理、污染治理，以及可追溯的监测、报告与核查。", "In the long term, I hope to apply AI and data science to environmental management, pollution control, and traceable monitoring, reporting and verification."),
      ],
      question: t(
        "怎样把一个环境问题，转成可计算、可验证，也能用于管理的研究？",
        "How can an environmental question become research that is computable, testable and useful for management?",
      ),
      href: "#contact",
      link: t("聊聊接下来的问题", "Talk about the questions ahead"),
    },
  ] as const;

function SpaceFragment() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <path d="M15 95L255 4L391 182L201 398L30 302Z" fill="#C03C2B" />
      <path d="M20 100L226 44L149 156L66 253Z" fill="#F2D169" />
      <path d="M149 156L227 43L363 177L255 282Z" fill="#FFF4D7" />
      <path d="M66 253L149 156L255 282L204 398Z" fill="#254CC7" />
      <path
        d="M227 43L238 275M87 107L344 180M66 253L344 180M149 156L238 275"
        fill="none"
        stroke="#2D2C46"
        strokeWidth="2"
      />
      <path
        d="M173 115L273 160L238 232L135 191Z"
        fill="none"
        stroke="#254CC7"
        strokeWidth="2"
      />
      <path
        d="M163 131L263 177M151 151L253 195M142 170L245 216M195 126L163 205M222 138L189 218M248 149L216 229"
        fill="none"
        stroke="#C03C2B"
        strokeWidth="1"
      />
      <circle cx="213" cy="174" r="8" fill="#2D2C46" />
      <path d="M24 308L149 252L239 290L204 398Z" fill="#FFF4D7" />
      <path d="M51 81L92 68M304 86L335 118" stroke="#FFF4D7" strokeWidth="4" />
    </svg>
  );
}

function SystemsFragment() {
  return (
    <svg viewBox="0 0 400 470" aria-hidden="true">
      <path d="M59 0L386 58L400 362L147 466L0 217Z" fill="#254CC7" />
      <path d="M61 0L228 128L8 216Z" fill="#F2D169" />
      <path d="M228 128L387 58L350 274L147 466Z" fill="#2347AA" />
      <path d="M228 128L350 274L122 330L8 216Z" fill="#C03C2B" />
      <path
        d="M79 196L174 151L248 198L231 283L122 307Z"
        fill="none"
        stroke="#FFF4D7"
        strokeWidth="2.5"
      />
      <path d="M100 217L173 185L218 216L205 257L135 274Z" fill="#FFF4D7" />
      <path
        d="M115 211L110 201M135 202L131 191M156 193L153 182M176 196L184 180M196 207L209 193M216 222L234 219M209 244L230 252M190 261L200 281M169 266L169 289M146 265L135 286M127 253L113 266M118 235L94 238"
        stroke="#2D2C46"
        strokeWidth="2"
      />
      <path d="M169 218L188 231L177 248L155 242L155 225Z" fill="#254CC7" />
      <path
        d="M248 198L297 159L320 115M231 283L309 292L336 332M79 196L38 160L60 95"
        fill="none"
        stroke="#FFF4D7"
        strokeWidth="2"
      />
      <circle cx="320" cy="115" r="8" fill="#F2D169" />
      <circle cx="336" cy="332" r="8" fill="#F2D169" />
      <path d="M125 348L242 317L203 384L147 465Z" fill="#F2D169" />
      <path
        d="M80 35L174 87M270 368L318 348"
        stroke="#C03C2B"
        strokeWidth="3"
      />
    </svg>
  );
}

function EnvironmentFragment() {
  return (
    <svg viewBox="0 0 430 350" aria-hidden="true">
      <path d="M76 0L430 89L376 334L0 350L8 111Z" fill="#C03C2B" />
      <path d="M76 0L263 94L142 215L8 111Z" fill="#FFF4D7" />
      <path d="M263 94L430 89L376 334L142 215Z" fill="#F2D169" />
      <path d="M142 215L376 334L0 350Z" fill="#254CC7" />
      <path d="M72 112L190 72L280 129L172 210Z" fill="#DDF3E4" />
      <path
        d="M89 118L197 94M108 135L216 111M125 152L231 127M142 170L243 143"
        stroke="#254CC7"
        strokeWidth="2"
      />
      <path d="M267 141L341 164L316 249L239 222Z" fill="#2D2C46" />
      <path
        d="M281 166L284 210L323 185"
        fill="none"
        stroke="#FFF4D7"
        strokeWidth="2"
      />
      <circle cx="281" cy="166" r="4" fill="#FFF4D7" />
      <circle cx="284" cy="210" r="4" fill="#FFF4D7" />
      <circle cx="323" cy="185" r="4" fill="#FFF4D7" />
      <path d="M54 253L138 240L155 280L68 295Z" fill="#F2D169" />
      <path
        d="M11 338L253 282L376 334"
        fill="none"
        stroke="#2D2C46"
        strokeWidth="2"
      />
      <path
        d="M352 74L391 84M92 305L152 318"
        stroke="#DDF3E4"
        strokeWidth="4"
      />
    </svg>
  );
}

const fragmentDrawings = [
  <SpaceFragment key="space" />,
  <SystemsFragment key="systems" />,
  <EnvironmentFragment key="environment" />,
];

export function PersonalPortrait({ quiet = false }: PersonalPortraitProps) {
  const { t } = useI18n();
  const directions = getPersonalFacets(t);
  const systemQuiet = useReducedMotion();
  const reduced = quiet || Boolean(systemQuiet);
  const [selected, setSelected] = useState(0);
  const [opened, setOpened] = useState(false);
  useCollapseOnLeave("next", () => setOpened(false));
  function selectDirection(index: number) {
    setSelected(index);
    setOpened(true);
  }
  const collageRef = useRef<HTMLDivElement>(null);
  const collageInView = useInView(collageRef, { once: false, amount: 0.25 });
  const collageReady = reduced || collageInView;
  const direction = directions[selected];
  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section
      id="next"
      className={`chapter portrait-chapter${reduced ? " is-quiet" : ""}`}
      aria-labelledby="portrait-title"
    >
      <div className="chapter-inner" ref={collageRef}>
        <div className="portrait-heading">
          <p className="chapter-kicker">{t("12 / 我的个人拼贴", "12 / A PERSONAL COLLAGE")}</p>
          <span>TIANYI CHEN / 2026</span>
        </div>
        <motion.div
          className="portrait-introduction"
          initial={reduced ? false : { x: -18, opacity: 0 }}
          animate={{ x: collageReady ? 0 : -18, opacity: collageReady ? 1 : 0 }}
          transition={
            slowMotion(reduced
              ? { duration: 0 }
              : { duration: 0.55, ease: [0.22, 1, 0.36, 1] })
          }
        >
          <h2 id="portrait-title">
            {t("陈天一，", "Choney Chen,")}
            <br />
            {t("生活、学习与愿景。", "life, learning and aspirations.")}
          </h2>
          <p>
            {t(
              "我从哪里来，怎样继续学习，以及更长远想走向哪里。",
              "Where I come from, how I keep learning and what I hope to work towards.",
            )}
          </p>
        </motion.div>
        <div className="portrait-layout">
          <div className="portrait-artwork">
            <div
              className="portrait-collage"
              role="group"
              aria-label={t(
                "点击或轻拖三块拼贴，认识陈天一的生活、学习与愿景",
                "Click or gently drag the three collage pieces to explore Choney Chen’s life, learning and aspirations",
              )}
            >
              <motion.svg
                className="portrait-base"
                viewBox="0 0 680 570"
                aria-hidden="true"
                initial={reduced ? false : { scale: 0.96, opacity: 0 }}
                animate={{
                  scale: collageReady ? 1 : 0.96,
                  opacity: collageReady ? 1 : 0,
                }}
                transition={
                  slowMotion(reduced
                    ? { duration: 0 }
                    : { duration: 0.6, ease: [0.22, 1, 0.36, 1] })
                }
              >
                <path
                  d="M14 119L403 8L655 201L578 539L58 560Z"
                  fill="#FFF4D7"
                />
                <path d="M18 118L223 87L94 301L60 559Z" fill="#F2D169" />
                <path d="M405 8L655 201L504 441L363 393Z" fill="#DDF3E4" />
                <path d="M94 301L363 393L576 539L59 559Z" fill="#FFF4D7" />
                <path
                  d="M53 141L511 63M108 495L585 326M235 45L213 509"
                  stroke="#2D2C466b"
                  strokeWidth="1"
                />
                <path d="M574 67L643 127L598 132Z" fill="#C03C2B" />
                <path d="M26 398L3 435L50 451Z" fill="#254CC7" />
                <path d="M625 405L653 435L608 471Z" fill="#F2D169" />
                <path d="M17 567L548 546" stroke="#2D2C46" strokeWidth="2" />
              </motion.svg>
              {directions.map((item, index) => (
                <motion.div
                  className="portrait-fragment-arrival"
                  key={item.id}
                  style={{ zIndex: opened && selected === index ? 4 : index + 1 }}
                  initial={
                    reduced
                      ? false
                      : {
                          x: [-64, 72, -42][index],
                          y: [28, -38, 56][index],
                          rotate: [-9, 10, -8][index],
                          scale: 0.96,
                          opacity: 0,
                        }
                  }
                  animate={{
                    x: collageReady ? 0 : [-64, 72, -42][index],
                    y: collageReady ? 0 : [28, -38, 56][index],
                    rotate: collageReady ? 0 : [-9, 10, -8][index],
                    scale: collageReady ? 1 : 0.96,
                    opacity: collageReady ? 1 : 0,
                  }}
                  transition={
                    slowMotion(reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.68,
                          delay: (collageReady ? index : 2 - index) * 0.14,
                          ease: [0.22, 1, 0.36, 1],
                        })
                  }
                >
                  <motion.button
                    type="button"
                    className={`portrait-fragment portrait-fragment-${item.id}${opened && selected === index ? " is-selected" : ""}`}
                    aria-pressed={opened && selected === index}
                    aria-expanded={opened && selected === index}
                    aria-controls="portrait-direction"
                    aria-label={t(
                      `阅读${item.label}：${item.subtitle}`,
                      `Read ${item.label}: ${item.subtitle}`,
                    )}
                    onClick={() => selectDirection(index)}
                    drag={!reduced}
                    dragConstraints={{
                      left: -24,
                      right: 24,
                      top: -24,
                      bottom: 24,
                    }}
                    dragElastic={0.16}
                    dragSnapToOrigin dragTransition={slowDragRelease}
                    onDragStart={() => selectDirection(index)}
                    whileHover={reduced ? undefined : { scale: 1.025 }}
                    whileTap={reduced ? undefined : { scale: 0.985 }}
                    transition={slowMotion(reduced ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 25 })}
                  >
                    {fragmentDrawings[index]}
                  </motion.button>
                </motion.div>
              ))}
            </div>
            <div
              className="portrait-selector"
              role="group"
              aria-label={t("选择个人笔记", "Choose a personal note")}
            >
              {directions.map((item, index) => (
                <motion.button
                  type="button"
                  key={item.id}
                  aria-pressed={opened && selected === index}
                  aria-expanded={opened && selected === index}
                  aria-controls="portrait-direction"
                  onClick={() => { if (opened && selected === index) setOpened(false); else selectDirection(index); }}
                  initial={
                    reduced
                      ? false
                      : { x: [-10, 0, 10][index], y: 9, opacity: 0 }
                  }
                  animate={{
                    x: collageReady ? 0 : [-10, 0, 10][index],
                    y: collageReady ? 0 : 9,
                    opacity: collageReady ? 1 : 0,
                  }}
                  transition={
                    slowMotion(reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.4,
                          delay: index * 0.14 + 0.2,
                          ease: [0.22, 1, 0.36, 1],
                        })
                  }
                >
                  <span>{item.index}</span>
                  <strong>{item.label}</strong>
                  <small>{item.subtitle}</small>
                </motion.button>
              ))}
            </div>
            <p className="portrait-art-note">
              <MoveUpRight size={13} aria-hidden="true" />
              {t(
                " 点选或轻拖一块，打开一段个人笔记。",
                " Click or gently drag a piece to open a personal note.",
              )}
            </p>
          </div>

          <motion.div
            id="portrait-direction"
            className="portrait-direction"
            aria-live="polite"
            initial={reduced ? false : { x: 18, opacity: 0 }}
            animate={{ x: collageReady ? 0 : 18, opacity: collageReady ? 1 : 0 }}
            transition={
              slowMotion(reduced
                ? { duration: 0 }
                : { duration: 0.58, ease: [0.22, 1, 0.36, 1] })
            }
          >
            <div className="reading-switch"><AnimatePresence initial={false}>
              <motion.div
                key={opened ? direction.id : "closed"}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                transition={slowMotion(transition)}
              >
                {opened ? <>
                <button type="button" className="portrait-close" aria-label={t("合上个人笔记", "Close personal note")} onClick={() => setOpened(false)}><X size={18}/></button>
                <span className="portrait-direction-number">
                  {direction.index} / {direction.label}
                </span>
                <h3>{direction.title}</h3>
                {direction.facts.map((fact, index) => <p className="portrait-experience" key={index}>{fact}</p>)}
                <div className="portrait-question">
                  <span>
                    {t("接下来，我想问", "The question I want to ask next")}
                  </span>
                  <p>{direction.question}</p>
                </div>
                <a className="chapter-link" href={direction.href}>
                  {direction.link}
                  <ArrowUpRight size={17} />
                </a>
                </> : <div className="portrait-closed-intro"><span className="portrait-direction-number">{t("三段个人笔记", "THREE PERSONAL NOTES")}</span><h3>{t("生活、学习，与下一步。", "Life, learning and the next step.")}</h3><p className="portrait-experience">{t("点选一块拼贴，看看我的来路、学习选择与长期愿景。", "Choose a collage piece to read about my journey, learning choices and long-term aspirations.")}</p></div>}
              </motion.div>
            </AnimatePresence></div>
          </motion.div>
        </div>
        <div className="portrait-bottom">
          <span>
            {t(
              "从十堰到苏州。从好奇到下一步。",
              "From Shiyan to Suzhou. From curiosity to the next step.",
            )}
          </span>
          <a
            href="https://github.com/ChoneyChen"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} />
            {t("在 GitHub 继续认识我", "Get to know me on GitHub")}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
