import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { slowMotion } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, QrCode, Github, Mail, Phone } from "lucide-react";
import { useI18n } from "../i18n";
import { WeChatQrDialog } from "./WeChatQrDialog";
import "./contact-chapter.css";

export function ContactChapter({ quiet = false }: { quiet?: boolean }) {
  const { t } = useI18n();
  const systemQuiet = useReducedMotion();
  const reduced = quiet || Boolean(systemQuiet);
  const letter = useRef<HTMLDivElement>(null);
  const entered = useInView(letter, { once: false, amount: 0.2 });
  const [qrOpen, setQrOpen] = useState(false);
  const qrTrigger = useRef<HTMLButtonElement>(null);
  const closeQr = useCallback(() => setQrOpen(false), []);
  useCollapseOnLeave("contact", closeQr);
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
                ref={qrTrigger}
                onClick={() => setQrOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={qrOpen}
                aria-label={t(
                  "打开 Choney1110 的微信二维码",
                  "Open WeChat QR code for Choney1110",
                )}
                title={t("微信二维码", "WeChat QR code")}
              >
                <QrCode size={19}/>
                <span>
                  {t("二维码", "QR")}
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
      <AnimatePresence>{qrOpen && <WeChatQrDialog close={closeQr} trigger={qrTrigger} quiet={reduced}/>}</AnimatePresence>
    </section>
  );
}
