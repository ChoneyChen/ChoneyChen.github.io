import { useLayoutEffect } from "react";
import { chapterInset } from "./chapterGeometry";

/** Calibrate explicit chapter links below the header without controlling free scrolling. */
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
      // Batch geometry reads; expanding a disclosure does not change its chapter's opening inset.
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
    // Observe the opening label, not a chapter whose height animates every frame.
    // Window resize and label/font changes cover the offsets used by explicit links.
    for (const { strip } of openings) if (strip) observer.observe(strip);
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
