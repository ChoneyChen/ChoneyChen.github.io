import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight, Github, MoveUpRight } from "lucide-react";
import { useI18n } from "../i18n";
import "./personal-portrait.css";

interface PersonalPortraitProps {
  quiet?: boolean;
}

const getDirections = (t: (zh: string, en: string) => string) =>
  [
    {
      id: "space",
      index: "01",
      label: t("视觉与空间", "Vision and space"),
      tools: "Cosmos-Loc / U-GLIMPSE",
      title: t(
        "我想继续，理解机器怎样看见空间。",
        "I want to understand how machines perceive space.",
      ),
      experience: t(
        "在 Cosmos-Loc 里，我重点参与 Qwen 训练与多轮实验。现在的毕业研究 U-GLIMPSE，正在探索图像生成模型怎样输出可解码的语义与几何信息。",
        "In Cosmos-Loc, my focus was Qwen training and repeated experiments. My current final-year project, U-GLIMPSE, explores how image generators might produce decodable semantic and geometric information.",
      ),
      question: t(
        "生成模型学到的视觉先验，能怎样变成可靠的感知？",
        "How can a generative model’s visual priors become reliable perception?",
      ),
      next: t(
        "我已推进课题、文献与实验设计，方法效果和跨域表现仍需要验证。",
        "I have developed the research framing, literature review and experimental design. Method performance and cross-domain behaviour still need validation.",
      ),
      href: "#glimpse",
      link: t("进入我的毕业研究", "Explore my final-year research"),
    },
    {
      id: "systems",
      index: "02",
      label: t("系统与工程", "Systems and engineering"),
      tools: "MEC202 / FastAPI / ESP32-S3",
      title: t(
        "我也喜欢，让不同的环节接得上。",
        "I also enjoy making the parts work together.",
      ),
      experience: t(
        "在智能光疗面罩项目中，我担任团队组长，参与软件、嵌入式、结构和系统联调。原型把视觉分析、结构化参数、设备控制与传感器反馈连接起来。",
        "I led the smart phototherapy mask team and contributed to software, embedded systems, the enclosure and integration. The prototype connects visual analysis, structured parameters, device control and sensor feedback.",
      ),
      question: t(
        "模型的建议，怎样经过控制与反馈，变成可以检查的动作？",
        "How can a model’s suggestion become a checkable action through control and feedback?",
      ),
      next: t(
        "我想继续把模型放进真实系统，关心接口、反馈、异常与团队交付。",
        "I want to keep bringing models into real systems, with attention to interfaces, feedback, failures and team delivery.",
      ),
      href: "#mask",
      link: t(
        "看看我的组长与联调工作",
        "Explore my team leadership and integration work",
      ),
    },
    {
      id: "environment",
      index: "03",
      label: t("环境与数据", "Environment and data"),
      tools: "ESG AI / Evidence linking",
      title: t(
        "我想把 AI，带进环境与科学数据。",
        "I want to bring AI into environmental and scientific data.",
      ),
      experience: t(
        "在清华大学苏州环境创新研究院实习，我参与文档模型整合、环境指标标准化、证据关联和数据平台建设。这是我进一步探索环境 AI 与科学数据的实践起点。",
        "At the Research Institute for Environmental Innovation, Suzhou, Tsinghua University, I help integrate document models, standardise environmental indicators, link evidence and build a data platform. This is my practical starting point for environmental AI and scientific data.",
      ),
      question: t(
        "让环境数据可追溯、可比较，究竟需要哪些条件？",
        "What does environmental data need to become traceable and comparable?",
      ),
      next: t(
        "继续推进数据流程与验证，也继续思考人工智能和环境科学之间的连接。",
        "Continue developing data workflows and validation, while exploring connections between AI and environmental science.",
      ),
      href: "#esg",
      link: t(
        "沿着数据回到环境 AI 实习",
        "Follow the data to my environmental AI internship",
      ),
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
      <text x="84" y="293" fill="#2D2C46" fontSize="10" letterSpacing="2">
        01 / LOOK CLOSER
      </text>
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
      <text
        x="150"
        y="357"
        fill="#2D2C46"
        fontSize="9"
        letterSpacing="2"
        transform="rotate(-12 150 357)"
      >
        02 / MAKE IT WORK
      </text>
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
      <text x="76" y="273" fill="#2D2C46" fontSize="10" letterSpacing="1.5">
        ESG / AI
      </text>
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
  const directions = getDirections(t);
  const systemQuiet = useReducedMotion();
  const reduced = quiet || Boolean(systemQuiet);
  const [selected, setSelected] = useState(0);
  const collageRef = useRef<HTMLDivElement>(null);
  const collageInView = useInView(collageRef, { once: true, amount: 0.25 });
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
      <div className="chapter-inner">
        <div className="portrait-heading">
          <p className="chapter-kicker">12 / THE MANY SIDES OF ME</p>
          <span>TIANYI CHEN / 2026</span>
        </div>
        <motion.div
          className="portrait-introduction"
          initial={reduced ? false : { x: -18, opacity: 0.6 }}
          animate={reduced ? { x: 0, opacity: 1 } : undefined}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <h2 id="portrait-title">
            {t("陈天一，", "Choney Chen,")}
            <br />
            {t("还在继续。", "still moving forward.")}
          </h2>
          <p>
            {t("这些兴趣，也都是我。", "These interests are all part of me.")}
            <br />
            {t(
              "视觉与空间、系统工程、环境 AI。",
              "Vision and space. Systems. Environmental AI.",
            )}
            <br />
            {t(
              "从已经做过的事，走向接下来的问题。",
              "From the work I have done to the questions ahead.",
            )}
          </p>
        </motion.div>
        <div className="portrait-layout">
          <div className="portrait-artwork">
            <div
              ref={collageRef}
              className="portrait-collage"
              role="group"
              aria-label={t(
                "点击或轻拖三块拼贴，认识陈天一的兴趣与方向",
                "Click or gently drag the three collage pieces to explore Choney Chen’s interests and directions",
              )}
            >
              <motion.svg
                className="portrait-base"
                viewBox="0 0 680 570"
                aria-hidden="true"
                initial={reduced ? false : { scale: 0.96, opacity: 0.5 }}
                animate={{
                  scale: collageReady ? 1 : 0.96,
                  opacity: collageReady ? 1 : 0.5,
                }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
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
                <text
                  x="511"
                  y="505"
                  fill="#2D2C46"
                  fontSize="16"
                  letterSpacing="4"
                  transform="rotate(-8 511 505)"
                >
                  C / C
                </text>
                <path d="M17 567L548 546" stroke="#2D2C46" strokeWidth="2" />
                <text
                  x="23"
                  y="31"
                  fill="#515069"
                  fontSize="8"
                  letterSpacing="3"
                >
                  CHONEY / AN ONGOING COMPOSITION
                </text>
              </motion.svg>
              {directions.map((item, index) => (
                <motion.div
                  className="portrait-fragment-arrival"
                  key={item.id}
                  style={{ zIndex: selected === index ? 4 : index + 1 }}
                  initial={
                    reduced
                      ? false
                      : {
                          x: [-64, 72, -42][index],
                          y: [28, -38, 56][index],
                          rotate: [-9, 10, -8][index],
                          scale: 0.96,
                          opacity: 0.55,
                        }
                  }
                  animate={{
                    x: collageReady ? 0 : [-64, 72, -42][index],
                    y: collageReady ? 0 : [28, -38, 56][index],
                    rotate: collageReady ? 0 : [-9, 10, -8][index],
                    scale: collageReady ? 1 : 0.96,
                    opacity: collageReady ? 1 : 0.55,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.68,
                          delay: index * 0.14,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                >
                  <motion.button
                    type="button"
                    className={`portrait-fragment portrait-fragment-${item.id}${selected === index ? " is-selected" : ""}`}
                    aria-pressed={selected === index}
                    aria-controls="portrait-direction"
                    aria-label={t(
                      `阅读我的${item.label}方向：${item.tools}`,
                      `Read my ${item.label} direction: ${item.tools}`,
                    )}
                    onClick={() => setSelected(index)}
                    drag={!reduced}
                    dragConstraints={{
                      left: -24,
                      right: 24,
                      top: -24,
                      bottom: 24,
                    }}
                    dragElastic={0.16}
                    dragSnapToOrigin
                    onDragStart={() => setSelected(index)}
                    whileHover={reduced ? undefined : { scale: 1.025 }}
                    whileTap={reduced ? undefined : { scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 210, damping: 25 }}
                  >
                    {fragmentDrawings[index]}
                  </motion.button>
                </motion.div>
              ))}
              <span className="portrait-collage-caption">
                {t(
                  "兴趣与方向的抽象拼贴",
                  "An abstract collage of interests and directions",
                )}
              </span>
            </div>
            <div
              className="portrait-selector"
              role="group"
              aria-label={t("直接选择个人方向", "Choose a personal direction")}
            >
              {directions.map((item, index) => (
                <motion.button
                  type="button"
                  key={item.id}
                  aria-pressed={selected === index}
                  onClick={() => setSelected(index)}
                  initial={
                    reduced
                      ? false
                      : { x: [-10, 0, 10][index], y: 9, opacity: 0.55 }
                  }
                  animate={{
                    x: collageReady ? 0 : [-10, 0, 10][index],
                    y: collageReady ? 0 : 9,
                    opacity: collageReady ? 1 : 0.55,
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.4,
                          delay: index * 0.14 + 0.2,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                >
                  <span>{item.index}</span>
                  <strong>{item.label}</strong>
                  <small>{item.tools}</small>
                </motion.button>
              ))}
            </div>
            <p className="portrait-art-note">
              <MoveUpRight size={13} aria-hidden="true" />
              {t(
                " 点选或轻拖一块，展开我对应的经历与下一问。",
                " Click or gently drag a piece to explore my experience and next question.",
              )}
              <br />
              <span>
                {t(
                  "原创立体主义启发拼贴，表达研究兴趣与工作方向。",
                  "An original Cubist-inspired collage of research interests and working directions.",
                )}
              </span>
            </p>
          </div>

          <motion.div
            id="portrait-direction"
            className="portrait-direction"
            aria-live="polite"
            initial={reduced ? false : { x: 18, opacity: 0.6 }}
            animate={reduced ? { x: 0, opacity: 1 } : undefined}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.58, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={direction.id}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                transition={transition}
              >
                <span className="portrait-direction-number">
                  {direction.index} / {direction.label}
                </span>
                <h3>{direction.title}</h3>
                <p className="portrait-experience">{direction.experience}</p>
                <div className="portrait-question">
                  <span>
                    {t("接下来，我想问", "The question I want to ask next")}
                  </span>
                  <p>{direction.question}</p>
                </div>
                <p className="portrait-next">{direction.next}</p>
                <a className="chapter-link" href={direction.href}>
                  {direction.link}
                  <ArrowUpRight size={17} />
                </a>
              </motion.div>
            </AnimatePresence>
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
