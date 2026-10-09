import { ReadingReveal } from "./ReadingReveal";
import { slowMotion } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
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
    title: t("先读懂文档。", "Read the document."),
    name: t("PDF 解析", "PDF parsing"),
    small: t("文本 / 表格 / 文档结构", "TEXT / TABLES / DOCUMENT STRUCTURE"),
    icon: ScanText,
    teaser: t(
      "让原始文字、表格与解析结果保留联系。",
      "Keep the source text, tables and parsed results connected.",
    ),
    body: t(
      "我参与建设 PDF 到结构化记录的流程，保留文本、表格与解析结果之间的联系。",
      "I helped build a PDF-to-record workflow that keeps source text, tables and parsed results connected.",
    ),
    work: [
      t(
        "整合文档理解与解析模块",
        "Integrate document understanding and parsing",
      ),
      t(
        "关联原始文字、表格与抽取结果",
        "Link source text, tables and extracted results",
      ),
      t(
        "考虑批量处理与本地部署",
        "Plan for batch processing and local deployment",
      ),
    ],
  },
  {
    number: "02",
    title: t("再连接模型。", "Connect the models."),
    name: t("抽取与匹配", "Extraction & matching"),
    small: "NuExtract3 / OCR-VL / Embedding",
    icon: FileText,
    teaser: t(
      "将文档理解、字段抽取与语义匹配整合起来。",
      "Bring document understanding, field extraction and semantic matching together.",
    ),
    body: t(
      "我参与整合 NuExtract3、PaddleOCR-VL 与 Qwen3-Embedding，连接文档理解、结构化抽取和语义匹配。",
      "I helped integrate NuExtract3, PaddleOCR-VL and Qwen3-Embedding for document understanding, structured extraction and semantic matching.",
    ),
    work: [
      t(
        "整合抽取、理解与语义匹配模块",
        "Integrate extraction, understanding and matching",
      ),
      t(
        "关注模型本地部署与计算资源",
        "Consider local deployment and compute resources",
      ),
      t("建设结构化数据流程", "Build a structured data workflow"),
    ],
  },
  {
    number: "03",
    title: t("让结果有来处。", "Trace every result."),
    name: t("标准化与证据", "Standards & evidence"),
    small: t("主体 / 期间 / 单位 / 边界", "ENTITY / PERIOD / UNITS / SCOPE"),
    icon: Link2,
    teaser: t(
      "保留口径、来源与版本，再谈数据比较。",
      "Preserve definitions, sources and versions before comparing data.",
    ),
    body: t(
      "我参与指标清洗、口径标准化与数据库建设，把主体、期间、单位和统计边界保留在可追溯记录中。",
      "I contributed to indicator cleaning, definition standardisation and database development, retaining the entity, period, units and scope in traceable records.",
    ),
    work: [
      t(
        "清洗指标与标准化统计口径",
        "Clean indicators and standardise definitions",
      ),
      t(
        "把抽取结果关联回原文证据",
        "Link extracted results to source evidence",
      ),
      t("保留数据版本与审核边界", "Retain data versions and review boundaries"),
    ],
  },
];

const makeModels = (t: Translate) => [
  {
    name: "NuExtract3",
    task: t("结构化抽取", "Structured extraction"),
    description: t(
      "在整合流程中承担字段与结构化信息抽取；我参与模块整合与数据流程建设。",
      "Extracts fields and structured information within the workflow. I contributed to module integration and data pipeline development.",
    ),
  },
  {
    name: "PaddleOCR-VL",
    task: t("文档理解", "Document understanding"),
    description: t(
      "用于文档理解与解析工作，支持后续文字、表格和抽取结果之间的关联。",
      "Supports document understanding and parsing, helping connect text, tables and extracted results downstream.",
    ),
  },
  {
    name: "Qwen3-Embedding",
    task: t("语义匹配", "Semantic matching"),
    description: t(
      "用于语义匹配相关模块，为指标与文本表达的关联提供基础；质量仍需真实评测。",
      "Supports semantic matching between indicators and text. Its quality still requires evaluation on real data.",
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
          <span>{t("苏州 · 2026.07 — 至今", "SUZHOU · SINCE JUL 2026")}</span>
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
                "Research Institute for Environmental Innovation (Suzhou), Tsinghua University",
              )}
              <br />
              <span>
                {t("本人角色 · AI 与数据分析实习生", "MY ROLE · AI & data analysis intern")}
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
              {t("解析仍在推进", "Parsing ongoing")}
            </small>
          </div>
        </header>

        <div className="esg-brief">
          <span className="esg-brief-mark">{t("我参与的工作", "MY CONTRIBUTION")}</span>
          <p>
            {t(
              "连接 PDF 解析、模型整合与证据关联，让环境报告中的数字成为可检查、可追溯的数据。",
              "Connect PDF parsing, model integration and source evidence so that environmental data can be checked and traced.",
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
                            <small>
                              {t(
                                "每条记录保留来源、口径与版本。",
                                "Keep sources, definitions and versions with each record.",
                              )}
                            </small>
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
          <div className="esg-folder-bottom">
            <span>DOCUMENT UNDERSTANDING / EXTRACTION / EVIDENCE LINKING</span>
            <span>OPEN FILE</span>
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
                "模型与本地工程正在整合。真实质量评测、完整审核发布闭环与生产部署仍需推进。20,000+ 是任务面对的报告规模，非已完成解析量。",
                "Model and local engineering integration is in progress. Evaluation on real data, the complete review and release workflow, and production deployment require further work. The 20,000+ figure is the task scope, not the number already parsed.",
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
          <a className="chapter-link" href="#glimpse">
            {t("接下来：我自己的毕业研究", "Next: my final-year research")}{" "}
            <ArrowDown size={17} />
          </a>
        </footer>
      </div>
    </section>
  );
}
