import { useEffect } from "react";
import {
  advanceReadingProgress, canSettleAfterRelease, getReleaseRadius, getSectionStops, positionBeforeInput,
  sampleReleaseAnimation, selectReleaseTarget, type ObservedPosition, type ReleaseAnimation,
} from "./sectionPaging";

type SectionPagingOptions = { enabled?: boolean; reduced?: boolean; headerOffset?: number };
type ReadingGesture = { mode: "wheel" | "touch" | "pointer" | "keyboard"; origin: number; lastPosition: number; direction: -1 | 0 | 1 };

const gestureControls = "input, textarea, select, [contenteditable='true'], [role='slider'], [role='dialog'], canvas, [data-paging-ignore]";
const keyboardControls = `${gestureControls}, button, a, summary, [role='button'], [role='tab'], [role='checkbox'], [role='radio'], [role='listbox']`;
const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

function closestControl(target: EventTarget | null, selector: string): Element | null {
  return target instanceof Element ? target.closest(selector) : null;
}

function eventTime(event: Event): number {
  // Old WebKit used epoch timestamps; current event timestamps share performance.now's clock.
  const timestamp = event.timeStamp > 1e12 ? event.timeStamp - performance.timeOrigin : event.timeStamp;
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : performance.now();
}

function isNestedScroller(target: EventTarget | null): boolean {
  let element = target instanceof Element ? target : null;
  while (element && element !== document.body && element !== document.documentElement) {
    if (element instanceof HTMLElement && element.scrollHeight > element.clientHeight + 2
      && /auto|scroll/.test(getComputedStyle(element).overflowY)) return true;
    element = element.parentElement;
  }
  return false;
}

/** Browser scrolling always owns the gesture; only a close, released heading may settle. */
export function useSectionPaging({ enabled = true, reduced = false, headerOffset = 78 }: SectionPagingOptions = {}) {
  useEffect(() => {
    const root = document.documentElement;
    if (!enabled || reduced) {
      root.dataset.paging = enabled ? "native" : "paused";
      root.style.setProperty("--paging-progress", "0");
      return () => { delete root.dataset.paging; root.style.removeProperty("--paging-progress"); };
    }

    const nativeScrollEnd = "onscrollend" in document;
    let disposed = false;
    let stops: number[] = [];
    let gesture: ReadingGesture | null = null;
    let animation: ReleaseAnimation | null = null;
    let animationFrame = 0;
    let measureFrame = 0;
    let settleTimer = 0;
    let inputVersion = 0;
    let lastInput = -Infinity;
    let lastScroll = -Infinity;
    let nativeEnded = false;
    let expectedY = window.scrollY;
    let touchDown = false;
    const pointers = new Set<number>();
    const keys = new Set<string>();
    const observations: ObservedPosition[] = [{ position: window.scrollY, at: 0 }];

    const phase = (name: string, progress = 0) => {
      root.dataset.paging = name;
      root.style.setProperty("--paging-progress", String(progress));
    };
    const clearSettling = () => { window.clearTimeout(settleTimer); settleTimer = 0; };
    const cancelAnimation = () => {
      inputVersion += 1;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      animation = null;
      delete root.dataset.pagingTarget;
    };
    const suppress = () => {
      cancelAnimation();
      clearSettling();
      gesture = null;
      nativeEnded = false;
      root.dataset.pagingRoute = "external";
      phase("ready");
    };

    const held = () => touchDown || pointers.size > 0 || keys.size > 0;
    const tick = (now: number) => {
      animationFrame = 0;
      if (!animation || disposed || held()) return;
      const sample = sampleReleaseAnimation(animation, now, inputVersion);
      if (!sample) return;
      // The only writes in this hook happen after native scrolling and the gesture ended.
      window.scrollTo({ top: sample.position, behavior: "instant" });
      expectedY = window.scrollY;
      phase("snapping", sample.progress);
      if (sample.done) {
        animation = null;
        phase("settled", 1);
      } else animationFrame = requestAnimationFrame(tick);
    };

    const settle = () => {
      settleTimer = 0;
      if (!gesture || animation || disposed) return;
      const now = performance.now();
      const inputQuiet = gesture.mode === "wheel" ? 180 : 80;
      if (!canSettleAfterRelease({ now, lastInput, lastScroll, inputQuiet, held: held(), reduced,
        nativeScrollEnd, nativeEnded })) {
        // scrollend will signal the end of native inertia; never guess ahead of it.
        if (!held() && (!nativeScrollEnd || nativeEnded)) {
          const delay = nativeScrollEnd ? Math.max(32, inputQuiet - (now - lastInput))
            : Math.max(32, 380 - (now - lastScroll), 300 - (now - lastInput));
          settleTimer = window.setTimeout(settle, delay);
        }
        return;
      }
      const target = selectReleaseTarget(stops, {
        origin: gesture.origin, position: window.scrollY, direction: gesture.direction,
        radius: getReleaseRadius(window.innerHeight),
      });
      root.dataset.pagingOrigin = String(gesture.origin);
      root.dataset.pagingDirection = String(gesture.direction);
      root.dataset.pagingReleasePosition = String(window.scrollY);
      root.dataset.pagingReleaseTarget = target === null ? "none" : String(target);
      gesture = null;
      nativeEnded = false;
      if (target === null) {
        root.dataset.pagingRoute = "free";
        phase("ready");
        return;
      }
      const from = window.scrollY;
      animation = { from, target, since: now, duration: 310 + Math.min(100, Math.abs(target - from) * 1.2), inputVersion };
      root.dataset.pagingTarget = String(target);
      root.dataset.pagingRoute = nativeScrollEnd ? "settle-native" : "settle-fallback";
      phase("released");
      animationFrame = requestAnimationFrame(tick);
    };
    const scheduleSettle = () => {
      clearSettling();
      if (!gesture || held() || (nativeScrollEnd && !nativeEnded)) return;
      settleTimer = window.setTimeout(settle, nativeScrollEnd ? 32 : 380);
    };

    const recordGesture = () => {
      if (!gesture) return;
      root.dataset.pagingOrigin = String(gesture.origin);
      root.dataset.pagingDirection = String(gesture.direction);
    };
    const beginInput = (mode: ReadingGesture["mode"], eligible: boolean, inputAt: number) => {
      const now = performance.now();
      const fresh = !gesture || gesture.mode !== mode || now - lastInput > 420 || Boolean(animation);
      // Every new input cancels our RAF immediately. Nothing consumes the input event.
      cancelAnimation();
      clearSettling();
      nativeEnded = false;
      lastInput = now;
      if (!eligible) {
        gesture = null;
        root.dataset.pagingRoute = "external";
        phase("ready");
        return;
      }
      if (fresh) {
        const origin = positionBeforeInput(observations, inputAt, window.scrollY);
        gesture = { mode, origin, lastPosition: origin, direction: 0 };
      }
      if (gesture) {
        const progress = advanceReadingProgress(gesture, window.scrollY);
        if (progress.lastPosition !== gesture.lastPosition) lastScroll = now;
        gesture = { ...gesture, ...progress };
        recordGesture();
      }
      root.dataset.pagingRoute = "native";
      phase("reading");
      if (!nativeScrollEnd) scheduleSettle();
    };

    const onScroll = (event: Event) => {
      const position = window.scrollY;
      // Keep actual document observations even for a fragment or a focus-driven movement.
      // They establish the next user's starting point without starting a snap session.
      const lastObservation = observations[observations.length - 1];
      if (Math.abs(position - lastObservation.position) >= 0.5) {
        observations.push({ position, at: eventTime(event) });
        if (observations.length > 80) observations.shift();
      }
      if (animation) {
        if (Math.abs(window.scrollY - expectedY) <= 2) return;
        suppress(); // Focus navigation or an external scroll owns its own endpoint.
        return;
      }
      if (!gesture) return;
      const progress = advanceReadingProgress(gesture, position);
      if (progress.lastPosition === gesture.lastPosition) return;
      gesture = { ...gesture, ...progress };
      recordGesture();
      lastScroll = performance.now();
      nativeEnded = false;
      phase("reading");
      if (!nativeScrollEnd) scheduleSettle();
    };
    const onScrollEnd = (event: Event) => {
      if (event.target !== document || animation || !gesture) return;
      nativeEnded = true;
      scheduleSettle();
    };
    const onWheel = (event: WheelEvent) => {
      const eligible = !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey
        && Math.abs(event.deltaY) > Math.abs(event.deltaX) && event.deltaY !== 0
        && !closestControl(event.target, gestureControls) && !isNestedScroller(event.target);
      beginInput("wheel", eligible, eventTime(event));
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const eligible = scrollKeys.has(event.key) && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.altKey
        && !closestControl(event.target, keyboardControls) && !isNestedScroller(event.target);
      if (eligible) keys.add(event.key);
      beginInput("keyboard", eligible, eventTime(event));
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (!keys.delete(event.key)) return;
      lastInput = performance.now();
      scheduleSettle();
    };
    const onPointerDown = (event: PointerEvent) => {
      pointers.add(event.pointerId);
      const mode = event.pointerType === "touch" ? "touch" : "pointer";
      beginInput(mode, !closestControl(event.target, keyboardControls) && !isNestedScroller(event.target), eventTime(event));
    };
    const onPointerEnd = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      lastInput = performance.now();
      scheduleSettle();
    };
    const onTouchStart = (event: TouchEvent) => {
      touchDown = true;
      beginInput("touch", !closestControl(event.target, keyboardControls) && !isNestedScroller(event.target), eventTime(event));
    };
    const onTouchEnd = (event: TouchEvent) => {
      touchDown = event.touches.length > 0;
      lastInput = performance.now();
      scheduleSettle();
    };
    const onClick = (event: MouseEvent) => {
      if (closestControl(event.target, keyboardControls)) suppress();
    };
    const onBlur = () => { pointers.clear(); keys.clear(); touchDown = false; suppress(); };

    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      const next = getSectionStops(
        [...document.querySelectorAll<HTMLElement>("main > section.chapter")].map((section) => {
          const bounds = section.getBoundingClientRect();
          const margin = parseFloat(getComputedStyle(section).scrollMarginTop);
          return { top: bounds.top + window.scrollY, height: bounds.height,
            scrollMarginTop: Number.isFinite(margin) ? margin : headerOffset };
        }), window.innerHeight, headerOffset, root.scrollHeight,
      );
      const changed = next.length !== stops.length || next.some((stop, index) => Math.abs(stop - stops[index]) > 1);
      stops = next;
      root.dataset.pagingStops = String(stops.length);
      if (changed) suppress(); // Expanding content recalibrates headings without moving the reader.
    };
    const queueMeasure = () => { if (!measureFrame) measureFrame = requestAnimationFrame(measure); };
    const onHashChange = () => { suppress(); queueMeasure(); };
    const onResize = () => { suppress(); queueMeasure(); };

    measure();
    phase("ready");
    root.dataset.pagingNativeScrollEnd = String(nativeScrollEnd);
    const observer = new ResizeObserver(queueMeasure);
    observer.observe(root);
    document.querySelectorAll("main, main > section.chapter").forEach((element) => observer.observe(element));
    const calibrationObserver = new MutationObserver(queueMeasure);
    document.querySelectorAll("main > section.chapter").forEach((element) => {
      calibrationObserver.observe(element, { attributes: true, attributeFilter: ["data-page-inset"] });
    });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scrollend", onScrollEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    window.addEventListener("pointerup", onPointerEnd, { capture: true, passive: true });
    window.addEventListener("pointercancel", onPointerEnd, { capture: true, passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("click", onClick, true);
    window.addEventListener("focusin", suppress, true);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("resize", onResize);
    window.addEventListener("blur", onBlur);

    return () => {
      disposed = true;
      cancelAnimation();
      clearSettling();
      if (measureFrame) cancelAnimationFrame(measureFrame);
      observer.disconnect();
      calibrationObserver.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointerup", onPointerEnd, true);
      window.removeEventListener("pointercancel", onPointerEnd, true);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("focusin", suppress, true);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("blur", onBlur);
      delete root.dataset.paging;
      delete root.dataset.pagingStops;
      delete root.dataset.pagingTarget;
      delete root.dataset.pagingRoute;
      delete root.dataset.pagingNativeScrollEnd;
      delete root.dataset.pagingOrigin;
      delete root.dataset.pagingDirection;
      delete root.dataset.pagingReleasePosition;
      delete root.dataset.pagingReleaseTarget;
      root.style.removeProperty("--paging-progress");
    };
  }, [enabled, reduced, headerOffset]);
}
