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
    let inputTimer = 0;
    let userScrolling = false;
    let frameHasUserInput = false;
    const seen = new WeakSet<Element>();
    const departed = new WeakSet<Element>();
    const sections = [...document.querySelectorAll<HTMLElement>("main > section.chapter")];
    const check = () => {
      pending = 0;
      const userMoved = frameHasUserInput;
      frameHasUserInput = false;
      const delta = window.scrollY - last;
      if (Math.abs(delta) < 2) return;
      last = window.scrollY;
      const bottomLimit = Math.max(96, window.innerHeight * .15);
      const topLimit = window.innerHeight * .85;
      const closing = new Set<HTMLElement>();
      // Batch reads before dispatching closes: a close can change the following chapter's layout.
      for (const section of sections) {
        const bounds = section.getBoundingClientRect();
        const chapterLeaving = delta > 0 ? bounds.bottom < bottomLimit : bounds.top > topLimit;
        if (chapterLeaving) {
          if (!departed.has(section)) {
            departed.add(section);
            closing.add(section);
          }
          continue;
        }
        if (bounds.bottom > bottomLimit && bounds.top < topLimit) departed.delete(section);
        if (bounds.bottom <= 96 || bounds.top >= window.innerHeight) continue;
        const controls = [...section.querySelectorAll<HTMLElement>("[aria-expanded='true'][aria-controls], [data-reading-open='true'][aria-controls]")];
        let layerLeaving = false;
        for (const control of controls) {
          const panel = document.getElementById(control.getAttribute("aria-controls")!);
          if (!panel || !section.contains(panel)) continue;
          const box = panel.getBoundingClientRect();
          if (box.height < 8) continue;
          if (box.bottom > 96 && box.top < topLimit) seen.add(panel);
          if (userMoved && seen.has(panel) && (delta > 0 ? box.bottom < bottomLimit : box.top > topLimit)) {
            layerLeaving = true;
            seen.delete(panel);
          }
        }
        for (const panel of section.querySelectorAll<HTMLDetailsElement>("details[open]")) {
          const box = panel.getBoundingClientRect();
          if (box.bottom > 96 && box.top < topLimit) seen.add(panel);
          if (userMoved && seen.has(panel) && (delta > 0 ? box.bottom < bottomLimit : box.top > topLimit)) {
            layerLeaving = true;
            seen.delete(panel);
          }
        }
        if (layerLeaving) closing.add(section);
      }
      for (const section of closing) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: section.id }));
        for (const disclosure of section.querySelectorAll<HTMLDetailsElement>("details[open]")) disclosure.open = false;
      }
    };
    // Focus/layout re-snapping can move a newly opened panel; only a reading gesture
    // should close a layer within its chapter. These listeners observe, never consume input.
    const expireInput = () => { userScrolling = false; };
    const observeInput = () => {
      userScrolling = true;
      window.clearTimeout(inputTimer);
      inputTimer = window.setTimeout(expireInput, 350);
    };
    const onWheel = (event: WheelEvent) => {
      if (!event.defaultPrevented && !event.ctrlKey && !event.metaKey
        && Math.abs(event.deltaY) > Math.abs(event.deltaX)) observeInput();
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.defaultPrevented) return;
      let target = event.target instanceof Element ? event.target : null;
      while (target && target !== document.body) {
        if (target.matches("canvas, input, textarea, select, [role='slider'], [contenteditable='true']")
          || /none|pan-x/.test(getComputedStyle(target).touchAction)) return;
        target = target.parentElement;
      }
      observeInput();
    };
    const onKey = (event: KeyboardEvent) => {
      const control = event.target instanceof Element && event.target.closest(
        "input, textarea, select, button, a, summary, canvas, [contenteditable='true'], [role='slider'], [role='tab']",
      );
      if (!control && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.altKey
        && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) observeInput();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button === 0
        && event.clientX >= Math.min(document.documentElement.clientWidth, window.innerWidth - 16)) observeInput();
    };
    const onScrollEnd = (event: Event) => {
      if (event.target === document) { window.clearTimeout(inputTimer); expireInput(); }
    };
    const onScroll = () => {
      if (userScrolling) { frameHasUserInput = true; observeInput(); }
      if (!pending) pending = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.addEventListener("scrollend", onScrollEnd);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("scrollend", onScrollEnd);
      window.clearTimeout(inputTimer);
      if (pending) cancelAnimationFrame(pending);
    };
  }, [enabled]);
}
