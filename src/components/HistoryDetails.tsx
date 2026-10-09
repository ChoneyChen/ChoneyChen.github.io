import { slowMotion } from "../lib/motionTiming";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { experienceTimeline, profile } from "../data/content";
import { useI18n } from "../i18n";
import "./history-details.css";

interface HistoryDetailProps {
  quiet?: boolean;
}

const getWorkDuties = (t: (zh: string, en: string) => string) =>
  [
    {
      number: "01",
      label: t("开发与联调", "Development"),
      title: t(
        "参与生产管理系统的开发与维护。",
        "Contributing to production-system development and maintenance.",
      ),
      description: t(
        "在汽车零部件企业的信息部门，我参与生产管理系统的功能开发、前后端联调和数据库核查，让页面、接口与数据能对应起来。",
        "In an automotive-parts company’s information department, I contributed to production-management features, front-end and back-end integration, and database checks, connecting interfaces with their underlying data.",
      ),
      tags: [
        t("生产管理系统", "Production systems"),
        t("前后端联调", "Front/back-end integration"),
        t("数据库核查", "Database checks"),
      ],
    },
    {
      number: "02",
      label: t("测试与支持", "Testing and support"),
      title: t(
        "在实际使用里，检查问题与异常。",
        "Checking problems in everyday use.",
      ),
      description: t(
        "参与功能测试、页面和界面验证，发现异常并反馈问题；也协助日常系统配置、故障排查与 IT 支持。",
        "I participated in functional testing and interface checks, identified exceptions and reported issues, and helped with system configuration, troubleshooting and IT support.",
      ),
      tags: [
        t("功能测试", "Functional testing"),
        t("异常反馈", "Issue reporting"),
        t("IT 支持", "IT support"),
      ],
    },
    {
      number: "03",
      label: t("协作与工具", "Collaboration"),
      title: t(
        "把工作留在版本、任务与记录里。",
        "Keeping work in versions, tasks and records.",
      ),
      description: t(
        "使用 Git 和任务管理工具参与代码提交、版本维护、问题记录与技术文档整理；同时参与企业 AI 办公工具推广，包括文档、检索、会议纪要和电子表格等场景。",
        "Using Git and task-management tools, I contributed code, maintained versions, recorded issues and organised technical documentation. I also helped introduce AI office tools for documents, search, meeting notes and spreadsheets.",
      ),
      tags: [
        t("Git 与任务记录", "Git and task records"),
        t("技术文档", "Technical documentation"),
        t("AI 办公工具", "AI office tools"),
      ],
    },
  ] as const;

function GearMark() {
  const teeth = Array.from({ length: 64 }, (_, index) => {
    const angle = (index / 64) * Math.PI * 2 - Math.PI / 2;
    const radius = index % 4 === 0 || index % 4 === 3 ? 27 : 33;
    return `${36 + Math.cos(angle) * radius},${36 + Math.sin(angle) * radius}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <polygon points={teeth} fill="currentColor" />
      <circle cx="36" cy="36" r="21" fill="#2e2420" />
      <circle
        cx="36"
        cy="36"
        r="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M36 23V30M49 36H42M36 49V42M23 36H30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="36" cy="36" r="4" fill="currentColor" />
    </svg>
  );
}

export function SteampunkWork({ quiet = false }: HistoryDetailProps) {
  const { t } = useI18n();
  const workDuties = getWorkDuties(t);
  const systemQuiet = useReducedMotion();
  const reduced = quiet || Boolean(systemQuiet);
  const [selected, setSelected] = useState(0);
  const consoleRef = useRef<HTMLDivElement>(null);
  const inView = useInView(consoleRef, { once: false, amount: 0.25 });
  const installed = reduced || inView;
  const duty = workDuties[selected];
  const experience = experienceTimeline.find((item) => item.id === "kaiding")!;

  return (
    <article
      className={`history-steampunk${reduced ? " is-quiet" : ""}`}
      aria-labelledby="kaiding-work-title"
    >
      <div className="steam-rivet steam-rivet-one" aria-hidden="true" />
      <div className="steam-rivet steam-rivet-two" aria-hidden="true" />
      <div className="steam-rivet steam-rivet-three" aria-hidden="true" />
      <div className="steam-rivet steam-rivet-four" aria-hidden="true" />
      <div className="steam-header">
        <span>MY WORK RECORD / SHIYAN</span>
        <h3 id="kaiding-work-title" className="steam-title">
          {t("凯鼎动力 · IT 实习", "Kaiding Power / IT internship")}
        </h3>
        <p className="steam-company">
          {t(
            "十堰凯鼎动力科技有限公司",
            "Shiyan Kaiding Power Technology Co., Ltd.",
          )}
        </p>
        <div className="steam-role">
          <span>{t("2024 夏", "Summer 2024")}</span>
          <span>IT Intern / Information Department</span>
          <span>{t("已完成", "Completed")}</span>
        </div>
      </div>
      <div ref={consoleRef} className="steam-console">
        <div
          className="steam-gear-track"
          role="group"
          aria-label={t(
            "阅读凯鼎实习的三类本人工作",
            "Read my three areas of work at Kaiding",
          )}
        >
          <span className="steam-track-line" aria-hidden="true" />
          {workDuties.map((item, index) => (
            <button
              type="button"
              key={item.number}
              aria-pressed={selected === index}
              aria-controls="kaiding-duty"
              onClick={() => setSelected(index)}
            >
              <motion.span
                className="steam-gear"
                initial={
                  reduced ? false : { rotate: index % 2 ? 34 : -34, y: -6 }
                }
                animate={{
                  rotate: installed
                    ? selected === index
                      ? 12
                      : 0
                    : index % 2
                      ? 34
                      : -34,
                  y: installed ? 0 : -6,
                }}
                transition={
                  slowMotion(reduced
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 110,
                        damping: 18,
                        delay: index * 0.07,
                      })
                }
              >
                <GearMark />
              </motion.span>
              <span className="steam-gear-number">{item.number}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>
        <div id="kaiding-duty" className="steam-duty-window" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected}
              className="steam-duty-plate"
              initial={reduced ? false : { x: 30, opacity: 0.65 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: reduced ? 0 : -30, opacity: reduced ? 1 : 0.55 }}
              transition={
                slowMotion(reduced
                  ? { duration: 0 }
                  : { duration: 0.24, ease: [0.22, 1, 0.36, 1] })
              }
            >
              <span className="steam-duty-index">DUTY / {duty.number}</span>
              <h4>{duty.title}</h4>
              <p>{duty.description}</p>
              <div className="steam-duty-tags">
                {duty.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="steam-bottom">
        <span className="steam-signature">Choney Chen</span>
        <span>
          {t("软件 / 支持 / 工程协作", "Software / support / collaboration")}
        </span>
      </div>
      <p className="steam-boundary">
        {t(
          experience.boundary || "",
          "Archived records end in August or on 1 September; formal dates should follow the internship certificate.",
        )}
      </p>
    </article>
  );
}

export function RomanEducation({ quiet = false }: HistoryDetailProps) {
  const { t, language } = useI18n();
  const systemQuiet = useReducedMotion();
  const reduced = quiet || Boolean(systemQuiet);
  const columnRef = useRef<HTMLDivElement>(null);
  const inView = useInView(columnRef, { once: false, amount: 0.25 });
  const formed = reduced || inView;

  return (
    <article
      className={`history-roman${reduced ? " is-quiet" : ""}`}
      aria-labelledby="roman-education-title"
    >
      <div className="roman-topline">
        <span>EDUCATION / XJTLU</span>
        <span>{t("陈天一 · 在读", "Tianyi Chen · currently enrolled")}</span>
      </div>
      <div className="roman-layout">
        <div ref={columnRef} className="roman-column">
          <svg viewBox="0 0 180 290" aria-hidden="true">
            <motion.g
              initial={reduced ? false : { y: 7, opacity: 0.5 }}
              animate={{ y: formed ? 0 : 7, opacity: formed ? 1 : 0.5 }}
              transition={slowMotion(reduced ? { duration: 0 } : { duration: 0.35 })}
            >
              <path d="M28 267H152V278H28Z" fill="#ddd0b6" stroke="#a68b68" />
              <path d="M22 278H158V285H22Z" fill="#cbbb9b" stroke="#a68b68" />
            </motion.g>
            <motion.g
              style={{ originX: 0.5, originY: 1 }}
              initial={reduced ? false : { scaleY: 0.08 }}
              animate={{ scaleY: formed ? 1 : 0.08 }}
              transition={
                slowMotion(reduced
                  ? { duration: 0 }
                  : { duration: 0.52, delay: 0.08, ease: [0.22, 1, 0.36, 1] })
              }
            >
              <path
                d="M51 82H129L124 253H56Z"
                fill="#f0e6d3"
                stroke="#a68b68"
              />
              <path
                d="M61 88L65 248M72 88L75 248M83 88L85 248M94 88L95 248M105 88L105 248M116 88L115 248"
                stroke="#c0aa87"
                fill="none"
              />
              <path d="M50 254H130V261H50Z" fill="#dacbad" stroke="#a68b68" />
              <path d="M43 261H137V267H43Z" fill="#e6d8bd" stroke="#a68b68" />
            </motion.g>
            <motion.g
              initial={reduced ? false : { y: 15, scale: 0.92, opacity: 0.45 }}
              animate={{
                y: formed ? 0 : 15,
                scale: formed ? 1 : 0.92,
                opacity: formed ? 1 : 0.45,
              }}
              transition={
                slowMotion(reduced
                  ? { duration: 0 }
                  : { duration: 0.48, delay: 0.3, ease: [0.22, 1, 0.36, 1] })
              }
            >
              <path d="M23 31H157V40H23Z" fill="#e7d9bf" stroke="#a68b68" />
              <path
                d="M31 43C26 29 53 32 56 47C60 63 45 66 39 55C34 46 48 40 51 50M149 43C154 29 127 32 124 47C120 63 135 66 141 55C146 46 132 40 129 50"
                fill="none"
                stroke="#a68b68"
                strokeWidth="2"
              />
              <path
                d="M53 48L69 63L78 45L90 66L102 45L111 63L127 48L119 80H61Z"
                fill="#e0d0b1"
                stroke="#a68b68"
              />
              <path
                d="M66 78L69 63M80 78L78 46M90 80V64M100 78L102 46M114 78L111 63"
                stroke="#b29b77"
              />
              <path d="M49 80H131V87H49Z" fill="#d6c4a3" stroke="#a68b68" />
            </motion.g>
          </svg>
          <span>{t("原创柱式示意", "Original column diagram")}</span>
        </div>
        <div className="roman-education-copy">
          <p className="roman-degree">{profile.education.degree}</p>
          <h3 id="roman-education-title" className="roman-title">
            {t(profile.education.university, "XJTLU")}
          </h3>
          <p className="roman-school-name">
            Xi’an Jiaotong-Liverpool University
          </p>
          <p className="roman-programme">
            {t("计算机科学与技术", "Computer Science and Technology")}
            {language === "zh" && (
              <>
                <br />
                <span>Computer Science and Technology</span>
              </>
            )}
          </p>
          <div className="roman-study-status">
            <div>
              <span>{t("学习时间", "Study period")}</span>
              <strong>2023.09 — 2027.06</strong>
              <small>{t("预计毕业", "Expected graduation")}</small>
            </div>
            <div>
              <span>{t("当前阶段", "Current stage")}</span>
              <strong>Stage 4</strong>
              <small>
                {t(
                  "本科最后一年 · 在读",
                  "Final-year undergraduate · enrolled",
                )}
              </small>
            </div>
          </div>
          <p className="roman-foundation">
            {t(
              "从编程、数据结构与统计建模出发，逐步走向多模态视觉、空间感知与环境 AI。",
              "From programming, data structures and statistical modelling towards multimodal vision, spatial perception and environmental AI.",
            )}
          </p>
        </div>
      </div>
      <div className="roman-course-strip">
        <span>{t("课程基础", "Course foundations")}</span>
        <p>
          {t(
            "编程与算法 · 软件与数据库 · 网络与系统 · 工程数学 · 嵌入式",
            "Programming and algorithms · software and databases · networks and systems · engineering mathematics · embedded systems",
          )}
        </p>
      </div>
      <p className="roman-note">
        {t(
          "教育信息按本人档案整理。柱式是设计表达，不代表西交利物浦校园建筑。",
          "Education details follow my personal records. The column is a design motif, not an XJTLU campus building.",
        )}
      </p>
    </article>
  );
}
