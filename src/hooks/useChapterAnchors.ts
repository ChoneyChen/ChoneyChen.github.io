import { useLayoutEffect } from "react";

/** Keep native links and gesture snapping aligned to each chapter's opening strip. */
export function useChapterAnchors() {
  useLayoutEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("main > section.chapter")];
    let pending = 0;
    let disposed = false;
    const measure = () => {
      pending = 0;
      if (disposed) return;
      document.documentElement.style.setProperty("--reading-frame", `${Math.max(1, window.innerHeight - 78)}px`);
      for (const section of sections) {
        const strip = section.querySelector<HTMLElement>(".chapter-kicker, .hero-kicker");
        if (!strip) continue;
        const offset = strip.getBoundingClientRect().top - section.getBoundingClientRect().top;
        const inset = section.id === "home" ? 0 : 96 - offset;
        section.style.scrollMarginTop = `${inset}px`;
        section.dataset.pageInset = String(inset);
      }
    };
    const schedule = () => { if (!pending) pending = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    for (const section of sections) {
      observer.observe(section);
      const content = section.querySelector(":scope > .chapter-inner, :scope > .hero-grid");
      if (content) observer.observe(content);
    }
    window.addEventListener("resize", schedule);
    document.fonts.ready.then(schedule);
    measure();
    return () => {
      disposed = true;
      if (pending) cancelAnimationFrame(pending);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      for (const section of sections) { section.style.removeProperty("scroll-margin-top"); delete section.dataset.pageInset; }
      document.documentElement.style.removeProperty("--reading-frame");
    };
  }, []);
}
