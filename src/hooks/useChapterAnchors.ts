import { useLayoutEffect } from "react";
import { chapterInset } from "./chapterGeometry";

/** Keep native links and gesture snapping aligned to each chapter's opening strip. */
export function useChapterAnchors() {
  useLayoutEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("main > section.chapter")];
    const openings = sections.map((section) => ({ section,
      strip: section.querySelector<HTMLElement>(".chapter-kicker, .hero-kicker") }));
    let pending = 0;
    let disposed = false;
    const measure = () => {
      pending = 0;
      if (disposed) return;
      // Finish all geometry reads before any write: disclosure animations resize every frame.
      const frame = `${Math.max(1, window.innerHeight - 78)}px`;
      const measurements = openings.flatMap(({ section, strip }) => strip
        ? [{ section, inset: chapterInset(section.getBoundingClientRect().top,
          strip.getBoundingClientRect().top, section.id === "home") }] : []);
      const root = document.documentElement;
      if (root.style.getPropertyValue("--reading-frame") !== frame) {
        root.style.setProperty("--reading-frame", frame);
      }
      for (const { section, inset } of measurements) {
        const value = `${inset}px`;
        if (section.style.scrollMarginTop !== value) section.style.scrollMarginTop = value;
        if (section.dataset.pageInset !== String(inset)) section.dataset.pageInset = String(inset);
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
