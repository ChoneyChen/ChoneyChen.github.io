import { useEffect, useRef } from "react";

const eventName = "choney:close-reading";

/** Close local reading state after its chapter or an observed reading layer leaves view. */
export function useCollapseOnLeave(id: string, close: () => void) {
  const callback = useRef(close);
  callback.current = close;
  useEffect(() => {
    const listener = (event: Event) => {
      if ((event as CustomEvent<string>).detail === id) callback.current();
    };
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [id]);
}

export function useReadingExit(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let last = window.scrollY;
    let pending = 0;
    const seen = new WeakSet<Element>();
    const check = () => {
      pending = 0;
      const delta = window.scrollY - last;
      last = window.scrollY;
      if (Math.abs(delta) < 2) return;
      const bottomLimit = Math.max(96, window.innerHeight * .15);
      const topLimit = window.innerHeight * .85;
      for (const section of document.querySelectorAll<HTMLElement>("main > section.chapter")) {
        const bounds = section.getBoundingClientRect();
        const chapterLeaving = delta > 0 ? bounds.bottom < bottomLimit : bounds.top > topLimit;
        const controls = [...section.querySelectorAll<HTMLElement>("[aria-expanded='true'][aria-controls]")];
        let layerLeaving = false;
        for (const control of controls) {
          const panel = document.getElementById(control.getAttribute("aria-controls")!);
          if (!panel || !section.contains(panel)) continue;
          const box = panel.getBoundingClientRect();
          if (box.height < 8) continue;
          if (box.bottom > 96 && box.top < topLimit) seen.add(panel);
          if (seen.has(panel) && (delta > 0 ? box.bottom < bottomLimit : box.top > topLimit)) layerLeaving = true;
        }
        for (const panel of section.querySelectorAll<HTMLDetailsElement>("details[open]")) {
          const box = panel.getBoundingClientRect();
          if (box.bottom > 96 && box.top < topLimit) seen.add(panel);
          if (seen.has(panel) && (delta > 0 ? box.bottom < bottomLimit : box.top > topLimit)) layerLeaving = true;
        }
        if (chapterLeaving || layerLeaving) {
          window.dispatchEvent(new CustomEvent(eventName, { detail: section.id }));
          for (const disclosure of section.querySelectorAll<HTMLDetailsElement>("details[open]")) disclosure.open = false;
        }
      }
    };
    const onScroll = () => { if (!pending) pending = requestAnimationFrame(check); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (pending) cancelAnimationFrame(pending); };
  }, [enabled]);
}
