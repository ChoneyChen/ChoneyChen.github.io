import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowUpRight, Check, Copy, Github, Mail, Phone } from "lucide-react";
import { useI18n } from "../i18n";
import "./contact-chapter.css";

export function ContactChapter({ quiet = false }: { quiet?: boolean }) {
  const { t } = useI18n();
  const letter = useRef<HTMLDivElement>(null);
  const entered = useInView(letter, { once: true, amount: 0.2 });
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copyWeChat() {
    try {
      await navigator.clipboard.writeText("Choney1110");
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  const ready = quiet || entered;
  return (
    <section
      id="contact"
      className="chapter contact-chapter"
      aria-labelledby="contact-title"
    >
      <div className="chapter-inner contact-inner">
        <div className="contact-intro">
          <p className="chapter-kicker">13 / A NOTE TO ME</p>
          <h2 id="contact-title">
            {t("故事还在继续。", "The conversation")}
            <br />
            <em>{t("我们，保持联系。", "continues.")}</em>
          </h2>
          <p>
            {t(
              "如果我的研究、项目，或者某个正在发生的想法，让你想聊一聊——这里可以找到我。",
              "If a project, a research question, or an idea here starts a conversation, this is where you can find me.",
            )}
          </p>
          <div className="contact-signature" aria-label="Choney Chen">
            Choney Chen<span>TIANYI CHEN</span>
          </div>
          <div className="contact-postmark" aria-hidden="true">
            <span>SHIYAN → SUZHOU</span>
            <strong>CC</strong>
            <span>PERSONAL CORRESPONDENCE</span>
          </div>
        </div>
        <div className="contact-envelope" ref={letter}>
          <div className="contact-envelope-lining" aria-hidden="true" />
          <motion.div
            className="contact-letter"
            initial={quiet ? false : { y: 75, rotate: -3, opacity: 0 }}
            animate={{
              y: ready ? 0 : 75,
              rotate: ready ? 0 : -3,
              opacity: ready ? 1 : 0,
            }}
            transition={
              quiet
                ? { duration: 0 }
                : { duration: 0.95, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <div className="contact-letter-head">
              <span>{t("收件人 / 陈天一", "TO / TIANYI CHEN")}</span>
              <span>OPEN CHANNELS</span>
            </div>
            <div className="contact-channel contact-wechat">
              <span className="contact-channel-kind">WECHAT</span>
              <div>
                <span className="contact-address">Choney1110</span>
                <small>{t("微信号", "WeChat ID")}</small>
              </div>
              <button
                onClick={copyWeChat}
                aria-label={t(
                  "复制微信号 Choney1110",
                  "Copy WeChat ID Choney1110",
                )}
                title={t("复制微信号", "Copy WeChat ID")}
              >
                {copied ? <Check size={18} /> : <Copy size={17} />}
                <span>
                  {copied ? t("已复制", "Copied") : t("复制", "Copy")}
                </span>
              </button>
            </div>
            <a className="contact-channel" href="tel:+8618862337116">
              <span className="contact-channel-kind">
                <Phone size={13} />
                {t("电话", "PHONE")}
              </span>
              <div>
                <span className="contact-address">18862337116</span>
                <small>{t("中国 · +86", "China · +86")}</small>
              </div>
              <ArrowUpRight size={19} />
            </a>
            <a className="contact-channel" href="mailto:Choney1110@gmail.com">
              <span className="contact-channel-kind">
                <Mail size={13} />
                EMAIL 01
              </span>
              <div>
                <span className="contact-address">Choney1110@gmail.com</span>
                <small>{t("写一封邮件", "Write a note")}</small>
              </div>
              <ArrowUpRight size={19} />
            </a>
            <a className="contact-channel" href="mailto:Tianyi1104@163.com">
              <span className="contact-channel-kind">
                <Mail size={13} />
                EMAIL 02
              </span>
              <div>
                <span className="contact-address">Tianyi1104@163.com</span>
                <small>{t("另一条通信地址", "An alternative address")}</small>
              </div>
              <ArrowUpRight size={19} />
            </a>
            <a
              className="contact-channel"
              href="https://github.com/ChoneyChen"
              target="_blank"
              rel="noreferrer"
            >
              <span className="contact-channel-kind">
                <Github size={13} />
                GITHUB
              </span>
              <div>
                <span className="contact-address">ChoneyChen</span>
                <small>github.com/ChoneyChen</small>
              </div>
              <ArrowUpRight size={19} />
            </a>
            <p className="contact-copy-status" role="status" aria-live="polite">
              {copyError
                ? t(
                    "请选中并复制微信号：Choney1110。",
                    "Please select and copy the ID: Choney1110.",
                  )
                : copied
                  ? t(
                      "微信号已复制，可以在微信中搜索。",
                      "WeChat ID copied. You can search for it in WeChat.",
                    )
                  : t(
                      "从一个问题，开始下一段对话。",
                      "A next conversation starts with a question.",
                    )}
            </p>
          </motion.div>
          <motion.div
            className="contact-envelope-front"
            aria-hidden="true"
            initial={quiet ? false : { rotateX: -32 }}
            animate={{ rotateX: ready ? 0 : -32 }}
            transition={
              quiet
                ? { duration: 0 }
                : { duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <span>CHONEY / PERSONAL ADDRESS BOOK</span>
          </motion.div>
        </div>
        <div className="contact-websites">
          <span>{t("个人主页", "THIS HOMEPAGE")}</span>
          <a
            href="https://choney-between-states.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            Vercel <ArrowUpRight size={13} />
          </a>
          <a
            href="https://choneychen.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Pages <ArrowUpRight size={13} />
          </a>
          <a href="#home">
            {t("回到开始", "Back to the beginning")} <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </section>
  );
}
