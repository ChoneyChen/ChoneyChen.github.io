import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useI18n } from "../i18n";
import { slowMotion } from "../lib/motionTiming";
import "./wechat-qr-dialog.css";

export function WeChatQrDialog({ close, trigger, quiet }: {
  close: () => void;
  trigger: RefObject<HTMLButtonElement | null>;
  quiet: boolean;
}) {
  const { t } = useI18n();
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const site = document.querySelector<HTMLElement>(".personal-site");
    const wasInert = site?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (site) site.inert = true;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Tab") { event.preventDefault(); closeButton.current?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      if (site) site.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [close, trigger]);
  return createPortal(
    <motion.div className="wechat-qr-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={slowMotion({ duration: quiet ? 0 : .2 })}
      onPointerDown={event => { if (event.target === event.currentTarget) close(); }}>
      <motion.div className="wechat-qr-dialog" role="dialog" aria-modal="true" aria-labelledby="wechat-qr-title" aria-describedby="wechat-qr-caption"
        initial={quiet ? false : { y: 16, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: quiet ? 0 : 10, scale: quiet ? 1 : .99 }}
        transition={slowMotion({ duration: quiet ? 0 : .28, ease: [.22, 1, .36, 1] })}>
        <header><h3 id="wechat-qr-title">{t("微信二维码", "WeChat QR code")}</h3><button ref={closeButton} type="button" onClick={close} aria-label={t("关闭二维码", "Close QR code")}><X size={20}/></button></header>
        <img src="/contact/wechat-qr.jpg" width="888" height="1131" alt={t("Choney 的微信二维码，扫码添加好友", "Choney’s WeChat QR code to add as a contact")} decoding="async"/>
        <p id="wechat-qr-caption">{t("扫码添加好友", "Scan to add me on WeChat")}<span>Choney1110</span></p>
      </motion.div>
    </motion.div>, document.body,
  );
}
