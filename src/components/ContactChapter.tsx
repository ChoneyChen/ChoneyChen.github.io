import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { slowMotion } from "../lib/motionTiming";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Copy, Github, Mail, Phone } from "lucide-react";
import { useI18n } from "../i18n";
import "./contact-chapter.css";

export function ContactChapter({ quiet = false }: { quiet?: boolean }) {
  const { t } = useI18n();
  const systemQuiet = useReducedMotion();
  const reduced = quiet || Boolean(systemQuiet);
  const letter = useRef<HTMLDivElement>(null);
  const entered = useInView(letter, { once: false, amount: 0.2 });
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
  const ready = reduced || entered;
  return (
    <section
      id="contact"
      className="chapter contact-chapter"
      aria-labelledby="contact-title"
    >
      <div className="chapter-inner contact-inner">
        <div className="contact-intro">
          <p className="chapter-kicker">11 / CONTACT</p>
          <h2 id="contact-title">
            {t("故事还在继续。", "The conversation")}
            <br />
            <em>{t("我们，保持联系。", "continues.")}</em>
          </h2>
          <p>
            {t(
              "从一个项目或问题，开始下一段对话。",
              "A project or a question can start our next conversation.",
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
            initial={reduced ? false : { y: 28, rotate: -1, opacity: 0 }}
            animate={{
              y: ready ? 0 : 28,
              rotate: ready ? 0 : -1,
              opacity: ready ? 1 : 0,
            }}
            transition={
              slowMotion(reduced
                ? { duration: 0 }
                : { duration: 0.72, ease: [0.16, 1, 0.3, 1] })
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
                  : ""}
            </p>
          </motion.div>
          <motion.div
            className="contact-envelope-front"
            aria-hidden="true"
            initial={reduced ? false : { rotateX: -12 }}
            animate={{ rotateX: ready ? 0 : -12 }}
            transition={
              slowMotion(reduced
                ? { duration: 0 }
                : { duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] })
            }
          >
            <span>CHONEY / PERSONAL ADDRESS BOOK</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
