import { useEffect, useLayoutEffect, useRef, useState, memo } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight, Check, Layers, Plus, X } from "lucide-react";
import { slowMotion, slowSpring, motionTimingStyle } from "./lib/motionTiming";
import { useReadingExit } from "./hooks/useCollapseOnLeave";
import { useChapterAnchors } from "./hooks/useChapterAnchors";
import { useI18n } from "./i18n";
import { siteChapters } from "./data/architecture";
import { ProfileHero } from "./components/ProfileHero";
import { ProfessionalExperience } from "./components/ProfessionalExperience";
import { CosmosChapter } from "./components/CosmosChapter";
import { SupsChapter } from "./components/SupsChapter";
import { MaskChapter } from "./components/MaskChapter";
import { ESGChapter } from "./components/ESGChapter";
import { FutureChapter } from "./components/FutureChapter";
import { ToolsChapter } from "./components/ToolsChapter";
import { ContactChapter } from "./components/ContactChapter";
import { ResearchDirections } from "./components/ResearchDirections";
import { PersonalArchive } from "./components/AcademicArchive";

const presentationTransition = slowMotion({ type: "spring", stiffness: 140, damping: 22 });
const quietTransition = { type: "tween", duration: 0 } as const;
function getChapters(t: (zh: string, en: string) => string) {
  return siteChapters.map(chapter => ({ ...chapter, label: t(chapter.label[0], chapter.label[1]), caption: t(chapter.caption[0], chapter.caption[1]), group: t(chapter.group[0], chapter.group[1]) }));
}
const MainChapters = memo(function MainChapters({ quiet }: { quiet: boolean }) {
  return <main>
    <ProfileHero quiet={quiet} />
    <ResearchDirections quiet={quiet} />
    <FutureChapter quiet={quiet} part="perception" />
    <CosmosChapter quiet={quiet} />
    <SupsChapter quiet={quiet} />
    <FutureChapter quiet={quiet} part="collaboration" />
    <MaskChapter quiet={quiet} />
    <ESGChapter quiet={quiet} />
    <ToolsChapter quiet={quiet} />
    <ProfessionalExperience quiet={quiet} />
    <PersonalArchive quiet={quiet} />
    <ContactChapter quiet={quiet} />
    <footer className="portfolio-footer"><a href="#home">CHONEY CHEN</a><span>© 2026</span><a href="https://github.com/ChoneyChen/ChoneyChen.github.io" target="_blank" rel="noreferrer">SOURCE ↗</a></footer>
  </main>;
});

export default function App() {
  const { t, language, setLanguage } = useI18n();
  const chapters = getChapters(t);
  const systemQuiet = useReducedMotion();
  const [manualQuiet, setManualQuiet] = useState(false);
  const quiet = manualQuiet || Boolean(systemQuiet);
  const [menuOpen, setMenuOpen] = useState(false);
  useChapterAnchors();
  useReadingExit(!menuOpen);
  const [active, setActive] = useState("home");
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuContainer = useRef<HTMLDivElement>(null);
  const readingAnchor = useRef<{ id: string; top: number } | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, slowSpring({
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
    restSpeed: 0.01,
  }));
  const activeIndex = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.id === active),
  );

  function switchLanguage() {
    const section = document.getElementById(active);
    if (section)
      readingAnchor.current = {
        id: active,
        top: section.getBoundingClientRect().top,
      };
    setLanguage(language === "en" ? "zh" : "en");
  }

  useLayoutEffect(() => {
    const snapshot = readingAnchor.current;
    if (!snapshot) return;
    const section = document.getElementById(snapshot.id);
    if (section)
      window.scrollBy({
        top: section.getBoundingClientRect().top - snapshot.top,
        behavior: "instant",
      });
    readingAnchor.current = null;
  }, [language]);

  useEffect(() => {
    const elements = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-18% 0px -70% 0px", threshold: 0 },
    );
    elements.forEach((element) => observer.observe(element));
    const hash = location.hash.startsWith("#project/")
      ? location.hash.replace("#project/", "")
      : location.hash.slice(1);
    if (location.hash.startsWith("#project/")) {
      history.replaceState(null, "", `#${hash}`);
    }
    // The SPA's sections become available after the browser's first hash lookup.
    const initialAnchor = requestAnimationFrame(() => {
      if (hash)
        document.getElementById(hash)?.scrollIntoView({ behavior: "instant" });
    });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(initialAnchor);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuContainer.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const elements =
          menuContainer.current?.querySelectorAll<HTMLElement>("a,button");
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <MotionConfig
      reducedMotion={quiet ? "always" : "user"}
      transition={quiet ? quietTransition : presentationTransition}
    >
      <div className="personal-site" data-quiet={quiet} style={motionTimingStyle}>
        <a href="#home" className="skip-link">
          {t("跳到个人介绍", "Skip to my introduction")}
        </a>
        <header className="site-header">
          <a className="site-wordmark" href="#home">
            CHONEY<span>{t("陈天一", "Tianyi Chen")}</span>
          </a>
          <span className="site-location">
            <span>{String(activeIndex).padStart(2, "0")}</span>
            {chapters[activeIndex].label}
          </span>
          <div className="header-actions">
            <button
              className="language-toggle"
              onClick={switchLanguage}
              aria-label={t("切换至英文", "Switch to Chinese")}
              title={t("切换至英文", "Switch to Chinese")}
            >
              <span className={language === "en" ? "is-active" : ""}>EN</span>
              <span className="language-slash">/</span>
              <span className={language === "zh" ? "is-active" : ""}>ZH</span>
            </button>
            <button
              className="quiet-toggle"
              aria-pressed={quiet}
              aria-label={t("切换轻动态", "Toggle reduced motion")}
              onClick={() => setManualQuiet(!manualQuiet)}
              title={
                systemQuiet
                  ? t(
                      "系统已启用减少动态",
                      "Reduced motion is enabled in your system",
                    )
                  : t("切换轻动态", "Toggle reduced motion")
              }
            >
              {quiet ? <Check size={14} /> : <Layers size={14} />}
              <span>{t("轻动态", "Less motion")}</span>
            </button>
            <button
              className="directory-toggle"
              ref={menuButton}
              aria-expanded={menuOpen}
              aria-controls="site-directory"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? t("关闭", "Close") : t("浏览目录", "Directory")}
              {menuOpen ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>
          <motion.div
            className="site-scroll-progress"
            style={{ scaleX: progress }}
          />
        </header>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="site-directory"
              className="site-directory"
              ref={menuContainer}
              role="dialog"
              aria-modal="true"
              aria-label={t(
                "个人主页章节目录",
                "Personal homepage chapter directory",
              )}
              initial={quiet ? false : { clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={
                slowMotion(quiet
                  ? { duration: 0 }
                  : { duration: 0.5, ease: [0.16, 1, 0.3, 1] })
              }
            >
              <div className="directory-intro">
                <p>{t("陈天一 / 个人主页", "Tianyi Chen / Portfolio")}</p>
                <h2>
                  {t("研究、工程，", "Research, engineering,")}
                  <br />
                  {t("与实践经历。", "and experience.")}
                </h2>
                <span>
                  {t(
                    "顺着往下读，也可以从任意一章开始。",
                    "Read in sequence, or begin at any chapter.",
                  )}
                </span>
              </div>
              <nav aria-label={t("全部个人主页章节", "All homepage chapters")}>
                {chapters.map((chapter, index) => (
                  <a
                    href={`#${chapter.id}`}
                    key={chapter.id}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="directory-number">
                      {String(index).padStart(2, "0")}
                    </span>
                    <span
                      className="directory-dot"
                      style={{ background: chapter.colour }}
                    />
                    <span>
                      {chapter.caption}
                      <small>{chapter.group}</small>
                    </span>
                    <ArrowUpRight size={20} />
                  </a>
                ))}
              </nav>
              <button
                className="directory-close"
                onClick={() => {
                  setMenuOpen(false);
                  menuButton.current?.focus();
                }}
              >
                {t("返回当前阅读", "Return to reading")}
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <MainChapters quiet={quiet} />
      </div>
    </MotionConfig>
  );
}
