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
      "我参与建设 PDF 到结构化记录的流程，把文档解析、原始文字与表格接入后续处理。版面和表格不是背景，它们决定一个数字究竟属于哪项内容。",
      "I helped build a workflow from PDFs to structured records, connecting document parsing, source text and tables to further processing. Layout and tables determine what a number actually describes.",
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
      "我参与整合 NuExtract3、PaddleOCR-VL 与 Qwen3-Embedding，让不同模块承担各自的任务。模型之间的输入、输出和工程安排，需要与数据流程一起考虑。",
      "I helped integrate NuExtract3, PaddleOCR-VL and Qwen3-Embedding, each with its own task. Their inputs, outputs and engineering requirements need to be considered alongside the data workflow.",
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
      "我参与环境指标清洗、口径标准化与数据库、分析平台建设。把结果关联回来源，同时保留主体、期间、单位和统计边界，是一项数据能够被检查和比较的前提。",
      "I contributed to environmental indicator cleaning, definition standardisation, database development and the analysis platform. Linking results to their sources while retaining the entity, period, units and scope makes data possible to check and compare.",
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
  const entered = useInView(folderRef, { once: true, amount: 0.18 });
  const revealed = entered || lowMotion;
  const [openPage, setOpenPage] = useState(0);
  const [model, setModel] = useState(0);
  const transition = {
    duration: lowMotion ? 0 : 0.45,
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
          <p className="chapter-kicker">07 / DOCUMENTS INTO EVIDENCE</p>
          <span>SUZHOU · SINCE JUL 2026</span>
        </div>
        <header className="esg-heading">
          <div>
            <p className="esg-institution">
              {t(
                "清华大学苏州环境创新研究院",
                "Research Institute for Environmental Innovation (Suzhou), Tsinghua University",
              )}
              <br />
              <span>
                {t("AI 与数据分析实习生", "AI & data analysis intern")}
              </span>
            </p>
            <h2 id="esg-title">
              {t("让每一个数字，", "Every number,")}
              <br />
              {t("找得到", "with a ")}
              <span>{t("来处。", "source.")}</span>
            </h2>
          </div>
          <div className="esg-scale-note">
            <span className="esg-note-corner" aria-hidden="true" />
            <p>THE SCALE OF THE TASK</p>
            <strong>
              20,000<span>+</span>
            </strong>
            <div>{t("任务面对的报告规模", "Reports in the task scope")}</div>
            <small>
              {t("是项目处理任务的规模，", "The scale of the project’s task,")}
              <br />
              {t("并非已完成解析的数量。", "not the number already parsed.")}
            </small>
          </div>
        </header>

        <div className="esg-brief">
          <span className="esg-brief-mark">ESG / AI</span>
          <p>
            {t(
              "环境报告里不缺数字。难的是知道，它属于谁、哪个期间、什么单位和统计边界。",
              "Environmental reports contain plenty of numbers. The challenge is identifying whose data it is, the reporting period, the units and the scope. ",
            )}
            <br />
            {t(
              "我参与把 PDF 解析、模型整合与证据关联连成系统，让一项数据先能够被检查。",
              "I help connect PDF parsing, model integration and evidence linking so that each record can be checked.",
            )}
          </p>
        </div>

        <div className="esg-folder" ref={folderRef}>
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
                          y: 45,
                          rotate: index % 2 ? 3 : -3,
                          rotateY: -18,
                        }
                  }
                  animate={{
                    opacity: revealed ? 1 : 0,
                    y: revealed ? 0 : 45,
                    rotate: revealed ? 0 : index % 2 ? 3 : -3,
                    rotateY: revealed ? 0 : -18,
                  }}
                  transition={{
                    ...transition,
                    layout: transition,
                    opacity: {
                      duration: lowMotion ? 0 : 0.4,
                      delay: lowMotion ? 0 : index * 0.12,
                    },
                    y: {
                      duration: lowMotion ? 0 : 0.85,
                      delay: lowMotion ? 0 : index * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    rotate: {
                      duration: lowMotion ? 0 : 0.85,
                      delay: lowMotion ? 0 : index * 0.12,
                    },
                    rotateY: {
                      duration: lowMotion ? 0 : 0.95,
                      delay: lowMotion ? 0 : index * 0.12,
                    },
                  }}
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
                    transition={{
                      duration: lowMotion ? 0 : 0.5,
                      delay: lowMotion ? 0 : 0.35 + index * 0.12,
                    }}
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
                    onClick={() => setOpenPage(isOpen ? -1 : index)}
                  >
                    <Icon size={25} strokeWidth={1.25} />
                    <span>
                      <small>{document.name}</small>
                      <strong>{document.title}</strong>
                    </span>
                    <motion.span
                      className="esg-paper-arrow"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: lowMotion ? 0 : 0.25 }}
                    >
                      <ChevronDown size={17} />
                    </motion.span>
                  </button>
                  <p className="esg-paper-teaser">{document.teaser}</p>
                  <div className="esg-paper-topic">{document.small}</div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="esg-paper-details"
                        id={`esg-page-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={transition}
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
                                  onClick={() => setModel(modelIndex)}
                                >
                                  {item.name}
                                  <ArrowUpRight size={11} />
                                </button>
                              ))}
                            </div>
                            <div
                              className="esg-model-detail"
                              aria-live="polite"
                            >
                              <span>{models[model].task}</span>
                              <p>{models[model].description}</p>
                            </div>
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
                                "工程链路说明，不是虚构的企业披露数据。",
                                "An engineering workflow description, without invented company disclosures.",
                              )}
                            </small>
                          </div>
                        )}
                        <div className="esg-paper-signature">
                          <span>MY CONTRIBUTION</span>
                          <span>C. CHEN</span>
                        </div>
                      </motion.div>
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
          <div>
            <span>
              {t("我在这段实习中持续思考", "A QUESTION I KEEP RETURNING TO")}
            </span>
            <p>
              {t("能抽出一个数字，", "Extracting a number")}
              <br />
              {t(
                "与能信任一项数据，之间还有很长的路。",
                "is only the beginning of making data trustworthy.",
              )}
            </p>
          </div>
          <div className="esg-project-state">
            <span className="esg-status-dot" />
            <strong>
              {t(
                "平台建设与实习进行中",
                "Platform development & internship in progress",
              )}
            </strong>
            <p>
              {t(
                "模型与本地工程已在整合。真实质量评测、完整审核发布闭环和生产部署仍需继续推进。",
                "Models and local engineering are being integrated. Evaluation on real data, the complete review and release workflow, and production deployment still need further work.",
              )}
            </p>
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
