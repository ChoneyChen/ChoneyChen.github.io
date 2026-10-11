import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUpRight, Workflow, X } from "lucide-react";
import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { slowMotion, slowDragRelease } from "../lib/motionTiming";
import { useI18n } from "../i18n";

function getIdentities(t: (zh: string, en: string) => string) {
  return [
    {
      label: t("学生", "Student"),
      number: "01",
      title: "XJTLU",
      subtitle: t("西交利物浦大学", "Xi’an Jiaotong-Liverpool University"),
      detail: t(
        "计算机科学与技术 · Bachelor of Engineering",
        "Computer Science and Technology · BEng",
      ),
      note: t("2023.09 — 2027.06（预计）", "2023.09 — 2027.06 (expected)"),
      stamp: "STAGE 4",
      lines: [
        t(
          "本科最后一年，正在推进毕业研究。",
          "In my final undergraduate year, working on my dissertation.",
        ),
        t(
          "从编程、统计与系统基础，走向视觉和空间感知。",
          "From programming, statistics, and systems to visual and spatial perception.",
        ),
      ],
      link: "#archive",
      linkLabel: t("教育与技术基础", "Education & technical foundation"),
    },
    {
      label: t("研究者", "Researcher"),
      number: "02",
      title: "PERCEPTION.",
      subtitle: t("视觉 · 空间 · 多模态", "Vision · Space · Multimodal AI"),
      detail: t(
        "Gordon Owusu Boateng 研究团队",
        "Gordon Owusu Boateng’s research team",
      ),
      note: t("视觉定位 / 生成式感知", "Visual localisation / generative perception"),
      stamp: "IN PROGRESS",
      lines: [
        t(
          "参与 Qwen 训练、控制变量实验与视觉定位。",
          "Qwen training, controlled experiments and visual localisation.",
        ),
        t(
          "当前毕业研究：驾驶场景中的图像生成式感知。",
          "Current dissertation: image generation for driving perception.",
        ),
      ],
      link: "#glimpse",
      linkLabel: t("走进我的毕业研究", "Explore my dissertation"),
    },
    {
      label: t("实践者", "Practitioner"),
      number: "03",
      title: "SYSTEMS.",
      subtitle: t(
        "软件 · 嵌入式 · 环境 AI",
        "Software · Embedded systems · Environmental AI",
      ),
      detail: t(
        "把不同的模块，做成可以检查的系统",
        "Connecting modules into systems we can examine",
      ),
      note: t(
        "工程原型 / 团队协作 / 数据平台",
        "Engineering prototypes / Teams / Data platforms",
      ),
      stamp: "HANDS ON",
      lines: [
        t(
          "参与本地软件、设备通信与传感反馈联调。",
          "Local software, device communication and sensor feedback.",
        ),
        t(
          "参与环境报告解析与可追溯数据记录。",
          "Environmental report parsing and traceable data records.",
        ),
      ],
      link: "#mask",
      linkLabel: t("看看我做的系统", "Explore my systems work"),
    },
  ];
}

function cycleTabs(
  event: ReactKeyboardEvent<HTMLDivElement>,
  current: number,
  count: number,
  select: (index: number) => void,
) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? count - 1
        : (current + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
  select(next);
  event.currentTarget
    .querySelectorAll<HTMLButtonElement>("[role='tab']")
    [next]?.focus();
}

function IdentityFold({ quiet, entered }: { quiet: boolean; entered: boolean }) {
  const { t } = useI18n();
  const identities = getIdentities(t);
  const [identity, setIdentity] = useState<number | null>(null);
  useCollapseOnLeave("home", () => setIdentity(null));
  const page = identity === null ? null : identities[identity];
  return (
    <motion.div
      className="identity-fold"
      initial={quiet ? false : { opacity: 0, rotateX: -16, y: 36 }}
      animate={quiet || entered ? { opacity: 1, rotateX: 0, y: 0 } : { opacity: 0, rotateX: -10, y: 28 }}
      transition={
        slowMotion(quiet
          ? { duration: 0 }
          : { duration: 0.9, delay: 0.22, ease: [0.16, 1, 0.3, 1] })
      }
    >
      <div className="identity-underleaf" aria-hidden="true">
        <span>TIANYI CHEN</span>
        <span>AN ONGOING INDEX</span>
      </div>
      <div
        className="identity-tabs"
        role="tablist"
        aria-label={t(
          "从三个身份认识陈天一",
          "Get to know Tianyi through three roles",
        )}
        onKeyDown={(event) =>
          cycleTabs(event, identity ?? 0, identities.length, setIdentity)
        }
      >
        {identities.map((item, index) => (
          <button
            key={item.label}
            role="tab"
            id={`identity-tab-${index}`}
            aria-controls="identity-page"
            aria-selected={identity === index}
            tabIndex={identity === index || (identity === null && index === 0) ? 0 : -1}
            aria-expanded={identity === index}
            onClick={() => setIdentity(identity === index ? null : index)}
          >
            <span>{item.number}</span>
            {item.label}
          </button>
        ))}
      </div>
      <motion.div
        className="identity-paper"
        drag={quiet ? false : "x"}
        dragConstraints={{ left: -44, right: 44 }}
        dragElastic={.05}
        dragSnapToOrigin
        dragTransition={slowDragRelease}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 20) setIdentity(((identity ?? (info.offset.x < 0 ? -1 : 1)) + (info.offset.x < 0 ? 1 : -1) + identities.length) % identities.length);
        }}
        animate={{
          rotate: quiet ? 0 : identity === 1 ? -2 : identity === 2 ? 2 : -4,
        }}
        transition={slowMotion(quiet ? { duration: 0 } : { type: "spring", stiffness: 130, damping: 20 })}
      >
        <div className="identity-paper-top">
          <span>CHONEY CHEN</span>
          <span>PERSONAL FILE / {page?.number ?? "INDEX"}</span>
        </div>
        <div className="reading-switch"><AnimatePresence initial={false}>
          {page && identity !== null ? <motion.div
            key={identity}
            role="tabpanel"
            id="identity-page"
            aria-labelledby={`identity-tab-${identity}`}
            className="identity-page"
            initial={{ opacity: 0, y: quiet ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: quiet ? 0 : -10 }}
            transition={slowMotion({ duration: quiet ? 0 : 0.22 })}
          >
            <button className="reading-close identity-close" onClick={() => setIdentity(null)} aria-label={t("合上身份档案", "Close role file")}><X size={16} /></button>
            <div className="identity-title">{page.title}</div>
            <h2>{page.subtitle}</h2>
            <p className="identity-detail">{page.detail}</p>
            <div className="identity-rule" />
            <p className="identity-note">{page.note}</p>
            <ul>
              {page.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            
          </motion.div> : <motion.div key="cover" className="identity-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={slowMotion({ duration: quiet ? 0 : 0.18 })}>
            <span className="identity-cover-index">THREE WAYS IN</span>
            <div className="identity-cover-name">Tianyi<br /><em>Chen.</em></div>
            <p>{t("学生、研究者、实践者。", "Student. Researcher. Practitioner.")}</p>
            <span>{t("点击标签或左右拖动纸页。", "Choose a tab or drag the paper sideways.")}</span>
          </motion.div>}
        </AnimatePresence></div>
        <span className="identity-stamp">{page?.stamp ?? "PERSONAL INDEX"}</span>
        <div className="identity-paper-bottom">
          <span>FROM SHIYAN</span>
          <span>BASED IN SUZHOU</span>
        </div>
      </motion.div>
      <button className="hero-pixel-ticket" aria-expanded={identity === 1} aria-controls="identity-page" onClick={() => setIdentity(identity === 1 ? null : 1)}>
        <span className="ticket-pixel" aria-hidden="true">
          ↗
        </span>
        <span>
          QWEN / LoRA
          <br />
          <b>{t("翻开研究身份", "Open research role")}</b>
        </span>
        <ArrowUpRight size={16} />
      </button>
      <button className="hero-prototype-ticket" aria-expanded={identity === 2} aria-controls="identity-page" onClick={() => setIdentity(identity === 2 ? null : 2)}>
        <span className="hero-system-icon" aria-hidden="true">
          <Workflow size={42} strokeWidth={1} />
        </span>
        <span>
          SYSTEM INTEGRATION.
          <br />
          <b>{t("翻开工程身份", "Open engineering role")}</b>
        </span>
        <ArrowUpRight size={16} />
      </button>
    </motion.div>
  );
}

export function ProfileHero({ quiet }: { quiet: boolean }) {
  const { t, language } = useI18n();
  const heroRef = useRef<HTMLDivElement>(null);
  const entered = useInView(heroRef, { amount: 0.12 });
  return (
    <section id="home" className="chapter personal-hero" aria-labelledby="profile-title">
      <div className="hero-grid" ref={heroRef}>
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="live-dot" /> A PERSONAL INDEX, 2026
          </div>
          <h1 id="profile-title">
            <span
              className="hero-name-cn"
              aria-label={t("陈天一。", "Tianyi Chen.")}
            >
              {(language === "zh"
                ? ["陈", "天", "一", "。"]
                : ["Tianyi", "."]
              ).map((letter, index) => (
                <motion.span
                  aria-hidden="true"
                  className={
                    letter === "。" || letter === "."
                      ? "hero-name-dot"
                      : undefined
                  }
                  key={letter}
                  initial={
                    quiet ? false : { y: 32, opacity: 0 }
                  }
                  animate={quiet || entered ? { y: 0, opacity: 1 } : { y: 22, opacity: 0 }}
                  transition={
                    slowMotion(quiet
                      ? { duration: 0 }
                      : {
                          duration: 0.75,
                          delay: index * 0.075,
                          ease: [0.16, 1, 0.3, 1],
                        })
                  }
                >
                  {letter}
                </motion.span>
              ))}
            </span>
            <motion.span
              className="hero-name-en"
              initial={quiet ? false : { clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: quiet || entered ? "inset(-12% -20% -18% -12%)" : "inset(0 100% 0 0)" }}
              transition={
                slowMotion(quiet
                  ? { duration: 0 }
                  : { duration: 1.05, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] })
              }
            >
              Choney{" "}
              <br />
              Chen
              <span className="hero-name-star" aria-hidden="true">
                ✳
              </span>
            </motion.span>
          </h1>
          <p className="hero-statement">
            {t("视觉 · 空间", "Vision. Space.")}
            <span>{t(" · 真实系统", " Working systems.")}</span>
          </p>
          <p className="hero-bio">{t("西交利物浦大学计算机本科生。研究感知，连接数据、模型与设备。", "Computer Science undergraduate at XJTLU. Exploring perception, connecting data, models and devices.")}</p>
          <p className="hero-basic-facts">
            BEng · Stage 4{" "}
            <span>{t("2023 — 2027（预计）", "2023 — 2027 (expected)")}</span>
          </p>
          <a className="hero-start" href="#directions">
            <span>
              {t("从我开始，慢慢往下看", "Start here. Follow the thread.")}
            </span>
            <ArrowDown size={18} />
          </a>
        </div>
        <IdentityFold quiet={quiet} entered={entered} />
      </div>
      <div className="hero-foot">
        <span>
          {t("湖北 · 十堰", "SHIYAN · HUBEI")}
          <span className="journey-line" />{" "}
          {t("江苏 · 苏州", "SUZHOU · JIANGSU")}
        </span>
        <span>RESEARCH / SYSTEMS / ENVIRONMENT</span>
        <span>
          {t("向下探索", "SCROLL TO EXPLORE")} <ArrowDown size={16} />
        </span>
      </div>
    </section>
  );
}

