import { ReadingReveal } from "./ReadingReveal";
import { slowMotion } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  FileText,
  FoldVertical,
  Link2,
  ScanText,
} from "lucide-react";
import { useI18n } from "../i18n";
import "./esg-chapter.css";

type Translate = (zh: string, en: string) => string;
const makeDocuments = (t: Translate) => [
  {
    number: "01",
    title: t("保留文档结构。", "Preserve document structure."),
    name: t("PDF 解析", "PDF parsing"),
    small: t("文本 / 表格 / 文档结构", "TEXT / TABLES / DOCUMENT STRUCTURE"),
    icon: ScanText,
    teaser: t(
      "恢复扫描页、文字与复杂表格的结构。",
      "Recover structure from scanned pages, text and tables.",
    ),
    body: t(
      "参与分阶段 PDF 处理链路，整合 OCR 与文档理解；关注批量吞吐、本地部署及各阶段的计算资源安排。",
      "Helped build a staged PDF workflow integrating OCR and document understanding. Considered batch throughput, local deployment and compute allocation across the processing stages.",
    ),
    work: [
      t(
        "OCR 与视觉文档理解",
        "OCR and visual document understanding",
      ),
      t(
        "分阶段计算资源安排",
        "Compute allocation across processing stages",
      ),
      t(
        "批量吞吐与扩展性",
        "Batch throughput and scalability",
      ),
    ],
  },
  {
    number: "02",
    title: t("抽取环境指标。", "Extract environmental indicators."),
    name: t("抽取与匹配", "Extraction & matching"),
    small: "NuExtract3 / PaddleOCR-VL / Qwen3-Embedding",
    icon: FileText,
    teaser: t(
      "将报告内容对应到可分析的字段。",
      "Map report content to fields for analysis.",
    ),
    body: t(
      "参与整合 NuExtract3、PaddleOCR-VL 和 Qwen3-Embedding，将报告中的不同指标表达映射为可分析的结构化字段。",
      "Helped integrate NuExtract3, PaddleOCR-VL and Qwen3-Embedding for extraction, document understanding and semantic matching, mapping differing environmental-indicator descriptions to structured fields for analysis.",
    ),
    work: [
      t(
        "碳排放与能源消耗指标",
        "Carbon-emission and energy-use indicators",
      ),
      t(
        "微塑料与气候影响相关记录",
        "Microplastic and climate-impact records",
      ),
      t("字段映射与文本语义匹配", "Field mapping and text semantic matching"),
    ],
  },
  {
    number: "03",
    title: t("让数据可核对、可比较。", "Make data traceable and comparable."),
    name: t("标准化与证据", "Standards & evidence"),
    small: t("主体 / 期间 / 单位 / 边界", "ENTITY / PERIOD / UNITS / SCOPE"),
    icon: Link2,
    teaser: t(
      "统一口径，关联原始 PDF 证据。",
      "Standardise definitions and link source PDF evidence.",
    ),
    body: t(
      "参与指标清洗、口径标准化及数据库与分析平台建设，关联来源和版本，使记录可审核并支持企业对标。",
      "Contributed to indicator cleaning, standardisation, database and analytics-platform development. Linked sources and versions so records could be reviewed before use in company comparisons.",
    ),
    work: [
      t(
        "主体、期间、单位与统计边界",
        "Entity, period, units and reporting scope",
      ),
      t(
        "原始文字、表格与数据版本",
        "Source text, tables and data versions",
      ),
      t("企业对标与探索性关联分析", "Company comparisons and exploratory association analysis"),
    ],
  },
];

function ESGProcessDiagram({
  present,
  lowMotion,
  t,
}: {
  present: boolean;
  lowMotion: boolean;
  t: Translate;
}) {
  const labels = [
    t("企业报告 PDF", "Company report PDF"),
    t("结构化环境指标", "Structured indicators"),
    t("关联来源证据", "Linked source evidence"),
  ];
  return (
    <figure className="esg-process-diagram">
      <figcaption>{t("处理链路示意", "WORKFLOW SCHEMATIC")}</figcaption>
      <ol>
        {labels.map((label, index) => (
          <li key={index}>
            <svg viewBox="0 0 160 88" aria-hidden="true">
              <motion.g
                initial={lowMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: present ? 1 : 0, x: present ? 0 : -8 }}
                transition={slowMotion({
                  duration: lowMotion ? 0 : 0.48,
                  delay: lowMotion ? 0 : present ? index * 0.12 : (2 - index) * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                })}
              >
                {index === 0 && (
                  <>
                    <path className="esg-process-paper" d="M44 9H100L116 25V79H44Z" />
                    <path className="esg-process-line" d="M100 9V25H116M56 25H87M56 35H102M56 64H103M56 71H90" />
                    <rect className="esg-process-highlight" x="55" y="43" width="48" height="13" rx="2" />
                    <path className="esg-process-ink" d="M61 49H96" />
                  </>
                )}
                {index === 1 && (
                  <>
                    <rect className="esg-process-paper" x="22" y="17" width="116" height="56" rx="3" />
                    {[0, 1, 2].map((row) => (
                      <motion.g
                        key={row}
                        initial={lowMotion ? false : { opacity: 0, x: -6 }}
                        animate={{ opacity: present ? 1 : 0, x: present ? 0 : -6 }}
                        transition={slowMotion({
                          duration: lowMotion ? 0 : 0.36,
                          delay: lowMotion ? 0 : present ? 0.16 + row * 0.06 : (2 - row) * 0.04,
                          ease: [0.22, 1, 0.36, 1],
                        })}
                      >
                        <rect className="esg-process-field-key" x="30" y={25 + row * 15} width="29" height="7" rx="2" />
                        <rect className={row === 1 ? "esg-process-highlight" : "esg-process-field-value"} x="67" y={25 + row * 15} width={row === 2 ? 40 : 61} height="7" rx="2" />
                      </motion.g>
                    ))}
                  </>
                )}
                {index === 2 && (
                  <>
                    <path className="esg-process-paper" d="M15 20H52L62 30V69H15Z" />
                    <path className="esg-process-line" d="M52 20V30H62M23 34H45M23 60H51" />
                    <rect className="esg-process-highlight" x="22" y="42" width="32" height="10" rx="2" />
                    <rect className="esg-process-paper" x="96" y="27" width="48" height="34" rx="3" />
                    <path className="esg-process-line" d="M105 36H134M105 52H126" />
                    <path className="esg-process-ink" d="M105 44H134" />
                    <motion.path
                      className="esg-process-link"
                      d="M58 47H72C79 47 78 44 85 44H96"
                      initial={lowMotion ? false : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: present ? 1 : 0, opacity: present ? 1 : 0 }}
                      transition={slowMotion({ duration: lowMotion ? 0 : 0.48, delay: lowMotion ? 0 : present ? 0.32 : 0 })}
                    />
                    <circle className="esg-process-anchor" cx="58" cy="47" r="2.5" />
                    <circle className="esg-process-anchor" cx="96" cy="44" r="2.5" />
                  </>
                )}
              </motion.g>
            </svg>
            <span>{label}</span>
            {index < 2 && (
              <svg className="esg-process-connector" viewBox="0 0 28 16" aria-hidden="true">
                <motion.path
                  d="M2 8H24M19 3L24 8L19 13"
                  initial={lowMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: present ? 1 : 0, opacity: present ? 1 : 0 }}
                  transition={slowMotion({ duration: lowMotion ? 0 : 0.4, delay: lowMotion ? 0 : present ? 0.12 + index * 0.12 : 0 })}
                />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function ESGChapter({ quiet = false }: { quiet?: boolean }) {
  const { t, language } = useI18n();
  const documents = makeDocuments(t);
  const prefersQuiet = useReducedMotion();
  const lowMotion = quiet || Boolean(prefersQuiet);
  const folderRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const entered = useInView(folderRef, { once: false, amount: "some" });
  const pipelineEntered = useInView(pipelineRef, { once: false });
  const revealed = entered || lowMotion;
  const [openPage, setOpenPage] = useState<number | null>(null);
  useCollapseOnLeave("esg", () => setOpenPage(null));
  const transition = {
    duration: lowMotion ? 0 : 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <section
      id="esg"
      lang={language}
      className={`chapter esg-chapter${lowMotion ? " is-quiet" : ""}`}
      aria-labelledby="esg-title"
    >
      <div className="chapter-inner esg-inner">
        <div className="esg-filing-line">
          <p className="chapter-kicker">{t("07 / 从报告到可追溯数据", "07 / DOCUMENTS INTO EVIDENCE")}</p>
          <span>{t("2026.07 — 至今", "2026.07 — PRESENT")}</span>
        </div>
        <header className="esg-heading">
          <div>
            <p className="esg-project-category">ESG AI</p>
            <h2 id="esg-title" className="project-title">
              {t("文档智能与", "Document Intelligence &")}
              <span>{t("环境数据分析平台", "Environmental Data Analytics Platform")}</span>
            </h2>
            <p className="esg-institution">
              {t(
                "清华大学苏州环境创新研究院",
                "Research Institute for Environmental Innovation, Suzhou, Tsinghua University",
              )}
              <br />
              <span className="project-role">
                {t("人工智能与数据分析实习生 · 进行中", "Artificial Intelligence & Data Analytics Intern · ongoing")}
              </span>
            </p>
          </div>
          <div className="esg-scale-note">
            <span className="esg-note-corner" aria-hidden="true" />
            <p>{t("任务规模", "TASK SCOPE")}</p>
            <strong>
              20,000<span>+</span>
            </strong>
            <div>{t("任务面对的报告规模", "Reports in the task scope")}</div>
            <small>{t("待处理范围，非已完成解析量", "Processing scope, not completed reports")}</small>
          </div>
        </header>

        <div className="esg-brief">
          <span className="esg-brief-mark">{t("本人工作", "MY WORK")}</span>
          <p className="project-summary">
            {t(
              "参与报告解析、环境指标标准化与证据关联，支持数据核对、比较及分析。",
              "Connecting report parsing, environmental indicators and source evidence so company records can be checked before comparison and analysis.",
            )}
          </p>
        </div>

        <div ref={pipelineRef} className="esg-process-scene" data-entry-state={pipelineEntered || lowMotion ? "present" : "reset"}>
          <ESGProcessDiagram present={pipelineEntered || lowMotion} lowMotion={lowMotion} t={t} />
        </div>

        <div className="esg-folder" ref={folderRef} data-entry-state={revealed ? "present" : "reset"}>
          <div className="esg-folder-tab">
            <span>CHONEY’S WORK FILE</span>
            <FoldVertical size={15} strokeWidth={1.5} />
          </div>
          <div className="esg-folder-topline">
            <span>
              {t(
                "参与的工程工作 / 进行中",
                "MY ENGINEERING WORK / IN PROGRESS",
              )}
            </span>
            {" "}<span>{t("三段处理链路", "THREE PROCESSING STAGES")}</span>
          </div>
          <div className="esg-folded-pages">
            {documents.map((document, index) => {
              const Icon = document.icon;
              const isOpen = openPage === index;
              return (
                <motion.article
                  className={`esg-paper esg-paper-${index + 1}${isOpen ? " is-open" : ""}`}
                  key={document.number}
                  layout
                  initial={
                    lowMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 24,
                          rotate: index % 2 ? 2 : -2,
                          rotateY: -12,
                        }
                  }
                  animate={{
                    opacity: revealed ? 1 : 0,
                    y: revealed ? 0 : 24,
                    rotate: revealed ? 0 : index % 2 ? 2 : -2,
                    rotateY: revealed ? 0 : -12,
                  }}
                  transition={slowMotion({
                    ...transition,
                    layout: transition,
                    opacity: {
                      duration: lowMotion ? 0 : 0.4,
                      delay: lowMotion ? 0 : revealed ? index * 0.08 : (documents.length - 1 - index) * 0.07,
                    },
                    y: {
                      duration: lowMotion ? 0 : revealed ? 0.65 : 0.4,
                      delay: lowMotion ? 0 : revealed ? index * 0.08 : (documents.length - 1 - index) * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    rotate: {
                      duration: lowMotion ? 0 : revealed ? 0.65 : 0.4,
                      delay: lowMotion ? 0 : revealed ? index * 0.08 : (documents.length - 1 - index) * 0.07,
                    },
                    rotateY: {
                      duration: lowMotion ? 0 : revealed ? 0.7 : 0.42,
                      delay: lowMotion ? 0 : revealed ? index * 0.08 : (documents.length - 1 - index) * 0.07,
                    },
                  })}
                >
                  <motion.div
                    className="esg-paper-registration"
                    initial={
                      lowMotion ? false : { clipPath: "inset(0 100% 0 0)" }
                    }
                    animate={{
                      clipPath: revealed
                        ? "inset(0 0% 0 0)"
                        : "inset(0 100% 0 0)",
                    }}
                    transition={slowMotion({
                      duration: lowMotion ? 0 : revealed ? 0.35 : 0.25,
                      delay: lowMotion ? 0 : revealed ? 0.25 + index * 0.07 : (documents.length - 1 - index) * 0.05,
                    })}
                  >
                    <span>{document.number} / FIELD NOTES</span>
                    <span className="esg-print-cross" aria-hidden="true">
                      +
                    </span>
                  </motion.div>
                  <button
                    className="esg-paper-heading"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`esg-page-${index}`}
                    onClick={() => setOpenPage(isOpen ? null : index)}
                  >
                    <Icon size={25} strokeWidth={1.25} />
                    <span>
                      <small>{document.name}</small>
                      <strong>{document.title}</strong>
                    </span>
                    <motion.span
                      className="esg-paper-arrow"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={slowMotion({ duration: lowMotion ? 0 : 0.25 })}
                    >
                      <ChevronDown size={17} />
                    </motion.span>
                  </button>
                  <p className="esg-paper-teaser">{document.teaser}</p>
                  <div className="esg-paper-topic">{document.small}</div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <ReadingReveal
                        className="esg-paper-details"
                        id={`esg-page-${index}`}
                        initial={{ gridTemplateRows: "0fr", opacity: 0 }}
                        animate={{ gridTemplateRows: "1fr", opacity: 1 }}
                        exit={{ gridTemplateRows: "0fr", opacity: 0 }}
                        transition={slowMotion(transition)}
                      >
                        <p className="esg-paper-body">{document.body}</p>
                        <ul>
                          {document.work.map((work) => (
                            <li key={work}>
                              <Check size={12} strokeWidth={1.4} />
                              <span>{work}</span>
                            </li>
                          ))}
                        </ul>
                        {index === 2 && (
                          <div
                            className="esg-source-chain"
                            aria-label={t(
                              "数据记录需要保留的来源与口径说明",
                              "Source and definition information retained with a data record",
                            )}
                          >
                            <span>{t("原文来源", "Source document")}</span>
                            <Link2 size={14} />
                            <span>{t("结构化记录", "Structured record")}</span>
                            <Link2 size={14} />
                            <span>
                              {t("口径与版本", "Definitions & versions")}
                            </span>
                          </div>
                        )}
                      </ReadingReveal>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="esg-afterword">
          <div className="esg-project-state">
            <span className="esg-status-dot" />
            <strong>{t("真实质量评测与发布闭环待推进", "Real-data evaluation & release workflow remain in development")}</strong>
            <details className="esg-project-scope">
              <summary>{t("当前阶段", "Current stage")}</summary>
              <p>{t(
                "真实数据质量评测、完整审核发布闭环与生产部署仍需推进。ESG 与财务表现的关联分析属于探索阶段，尚无确认的显著性或因果结论。",
                "Evaluation on real data, the review and release workflow, and production deployment require further work. ESG–financial association analysis is exploratory, with no confirmed significance or causal conclusion.",
              )}</p>
            </details>
          </div>
        </div>
        <footer className="esg-footer">
          <a
            className="chapter-link"
            href="https://github.com/ChoneyChen/ESG_DATA_PLATFORM"
            target="_blank"
            rel="noreferrer"
          >
            {t(
              "查看环境数据平台公开代码",
              "View the environmental data platform code",
            )}{" "}
            <ArrowUpRight size={17} />
          </a>
        </footer>
      </div>
    </section>
  );
}
