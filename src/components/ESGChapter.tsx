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
  ArrowDown,
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
      "识别扫描页、文字与复杂表格。",
      "Recover text and tables from inconsistent PDF layouts.",
    ),
    body: t(
      "参与搭建分阶段的 PDF 处理链路，并关注数万份报告的批量处理与本地部署。",
      "Helped build a staged PDF-processing workflow, considering batch processing and local deployment for a large report collection.",
    ),
    work: [
      t(
        "OCR 与视觉文档理解",
        "OCR and visual document understanding",
      ),
      t(
        "分配不同处理阶段的计算资源",
        "Consider compute allocation across processing stages",
      ),
      t(
        "关注处理吞吐量与扩展性",
        "Assess throughput and scalability requirements",
      ),
    ],
  },
  {
    number: "02",
    title: t("抽取环境指标。", "Extract environmental indicators."),
    name: t("抽取与匹配", "Extraction & matching"),
    small: "NuExtract3 / OCR-VL / Embedding",
    icon: FileText,
    teaser: t(
      "将报告内容对应到可分析的字段。",
      "Map report content to fields for analysis.",
    ),
    body: t(
      "参与文档理解、结构化抽取与语义匹配模块的整合，处理不同报告对环境指标的不同表达。",
      "Helped integrate document-understanding, structured-extraction and semantic-matching modules to handle differing descriptions of environmental indicators.",
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
      "参与指标清洗、数据库及分析平台建设，使抽取结果进入可审核的数据记录。",
      "Contributed to indicator cleaning, database development and analytics-platform work, bringing extracted results into reviewable records.",
    ),
    work: [
      t(
        "统一主体、期间、单位与统计边界",
        "Standardise entity, period, units and reporting scope",
      ),
      t(
        "关联原始文字、表格与数据版本",
        "Link source text, tables and data versions",
      ),
      t("探索企业对标及 ESG 与财务表现的统计关联", "Explore company comparisons and statistical links between ESG and financial performance"),
    ],
  },
];

const makeModels = (t: Translate) => [
  {
    name: "NuExtract3",
    task: t("结构化抽取", "Structured extraction"),
    description: t(
      "在流程中提取字段与结构化信息。",
      "Extracts fields and structured information in the workflow.",
    ),
  },
  {
    name: "PaddleOCR-VL",
    task: t("文档理解", "Document understanding"),
    description: t(
      "理解 PDF 版面、扫描文字及复杂表格。",
      "Supports PDF layout, scanned-text and complex-table understanding.",
    ),
  },
  {
    name: "Qwen3-Embedding",
    task: t("语义匹配", "Semantic matching"),
    description: t(
      "提供文本向量表示，用于指标与报告表述的语义匹配。",
      "Provides text embeddings for semantic matching between indicators and report language.",
    ),
  },
];

export function ESGChapter({ quiet = false }: { quiet?: boolean }) {
  const { t, language } = useI18n();
  const documents = makeDocuments(t);
  const models = makeModels(t);
  const prefersQuiet = useReducedMotion();
  const lowMotion = quiet || Boolean(prefersQuiet);
  const folderRef = useRef<HTMLDivElement>(null);
  const entered = useInView(folderRef, { once: false, amount: "some" });
  const revealed = entered || lowMotion;
  const [openPage, setOpenPage] = useState<number | null>(null);
  const [model, setModel] = useState<number | null>(null);
  useCollapseOnLeave("esg", () => { setOpenPage(null); setModel(null); });
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
            <p className="esg-project-category">{t("环境 AI · 数据工程", "ENVIRONMENTAL AI · DATA ENGINEERING")}</p>
            <h2 id="esg-title">
              {t("ESG 环境", "ESG Data")}
              <br />
              <span>{t("数据平台", "Platform")}</span>
            </h2>
            <p className="esg-institution">
              {t(
                "清华大学苏州环境创新研究院",
                "Research Institute for Environmental Innovation, Suzhou, Tsinghua University",
              )}
              <br />
              <span>
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
            <small>
              {t("处理范围，非已完成解析量", "Task scope, not reports already parsed")}
            </small>
          </div>
        </header>

        <div className="esg-brief">
          <span className="esg-brief-mark">{t("核心问题", "CORE QUESTION")}</span>
          <p>
            {t(
              "扫描页、复杂表格与不同统计口径，怎样成为可核对的环境数据？",
              "How can scanned pages, complex tables and differing reporting definitions become environmental data we can verify?",
            )}
          </p>
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
            <span>
              {t("展开折页，读我的工作", "Unfold a page to read my work")}
            </span>
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
                        {index === 1 && (
                          <div className="esg-model-index">
                            <p>
                              {t(
                                "选择模块，查看在流程中的作用",
                                "Choose a module to see its role",
                              )}
                            </p>
                            <div
                              className="esg-model-buttons"
                              aria-label={t(
                                "查看我参与整合的模型模块",
                                "Explore the model modules I helped integrate",
                              )}
                            >
                              {models.map((item, modelIndex) => (
                                <button
                                  key={item.name}
                                  type="button"
                                  aria-pressed={model === modelIndex}
                                  onClick={() => setModel((current) => current === modelIndex ? null : modelIndex)}
                                  aria-expanded={model === modelIndex}
                                  aria-controls="esg-model-detail"
                                >
                                  {item.name}
                                  <ArrowUpRight size={11} />
                                </button>
                              ))}
                            </div>
                            <AnimatePresence initial={false}>
                            {model !== null && <ReadingReveal
                              className="esg-model-detail"
                              id="esg-model-detail"
                              aria-live="polite"
                              initial={{ gridTemplateRows: "0fr", opacity: 0 }}
                              animate={{ gridTemplateRows: "1fr", opacity: 1 }}
                              exit={{ gridTemplateRows: "0fr", opacity: 0 }}
                              transition={slowMotion({ duration: lowMotion ? 0 : 0.35 })}
                            >
                              <span>{models[model].task}</span>
                              <p>{models[model].description}</p>
                            </ReadingReveal>}
                            </AnimatePresence>
                          </div>
                        )}
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
                        <div className="esg-paper-signature">
                          <span>MY CONTRIBUTION</span>
                          <span>C. CHEN</span>
                        </div>
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
            <strong>
              {t(
                "平台建设与实习进行中",
                "Platform development & internship in progress",
              )}
            </strong>
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
          <a className="chapter-link" href="#tools">
            {t("下一部分：我的技术工具", "Next: my technical toolkit")}{" "}
            <ArrowDown size={17} />
          </a>
        </footer>
      </div>
    </section>
  );
}
