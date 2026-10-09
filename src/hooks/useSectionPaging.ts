import { useEffect } from "react";
import { accumulateWheel, adjacentStop, getSectionStops, nearestStop, shouldCaptureHeading, type WheelGesture } from "./sectionPaging";

type SectionPagingOptions = {
  enabled?: boolean;
  reduced?: boolean;
  headerOffset?: number;
};

type PageAnimation = {
  kind: "preview" | "snap" | "return";
  from: number;
  target: number;
  since: number;
  duration: number;
};

const wheelControls = "input, textarea, select, [contenteditable='true'], [role='slider'], [role='dialog'], canvas, [data-paging-ignore]";
const keyboardControls = `${wheelControls}, button, a, summary, [role='button'], [role='tab'], [role='checkbox'], [role='radio'], [role='listbox']`;

function closestControl(target: EventTarget | null, selector: string): Element | null {
  return target instanceof Element ? target.closest(selector) : null;
}

function nestedScroller(target: EventTarget | null, direction: number): boolean {
  let element = target instanceof Element ? target : null;
  while (element && element !== document.body && element !== document.documentElement) {
    if (element instanceof HTMLElement && element.scrollHeight > element.clientHeight + 2) {
      const style = getComputedStyle(element);
      if (/auto|scroll/.test(style.overflowY)) {
        const canScroll = direction > 0
          ? element.scrollTop + element.clientHeight < element.scrollHeight - 1
          : element.scrollTop > 1;
        if (canScroll || /contain|none/.test(style.overscrollBehaviorY)) return true;
      }
    }
    element = element.parentElement;
  }
  return false;
}

/** Continuous document reading with a damped capture near the next chapter heading. */
export function useSectionPaging({ enabled = true, reduced = false, headerOffset = 78 }: SectionPagingOptions = {}) {
  useEffect(() => {
    const root = document.documentElement;
    if (!enabled) {
      root.dataset.paging = "paused";
      root.style.setProperty("--paging-progress", "0");
      return () => { delete root.dataset.paging; };
    }

    let disposed = false;
    let stops: number[] = [];
    let frame = Math.max(1, window.innerHeight - headerOffset);
    let animation: PageAnimation | null = null;
    let animationFrame = 0;
    let measureFrame = 0;
    let settleTimer = 0;
    let wheelTimer = 0;
    let gesture: WheelGesture | null = null;
    let nativeBoundary: { target: number; direction: 1 | -1 } | null = null;
    let origin = window.scrollY;
    let expectedY = window.scrollY;
    let pointerDown = false;
    let touchDown = false;
    let touchOrigin = window.scrollY;
    let touchMoved = false;
    let inputMode: "external" | "wheel" | "touch" | "free" = "external";
    let externalUntil = performance.now() + 900;

    const phase = (name: string, progress = 0) => {
      root.dataset.paging = name;
      root.style.setProperty("--paging-progress", String(progress));
    };

    const cancelAnimation = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      animation = null;
    };

    const writePosition = (position: number) => {
      // Explicit instant behavior avoids stacking the site's native smooth hash navigation.
      window.scrollTo({ top: position, behavior: "instant" });
      expectedY = window.scrollY;
    };

    const tick = (now: number) => {
      animationFrame = 0;
      if (!animation || disposed) return;
      if (animation.kind === "preview") {
        const difference = animation.target - window.scrollY;
        if (Math.abs(difference) <= 0.6) {
          writePosition(animation.target);
          animation = null;
          return;
        }
        writePosition(window.scrollY + difference * 0.24);
      } else {
        const progress = Math.min(1, (now - animation.since) / animation.duration);
        const ease = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
        writePosition(animation.from + (animation.target - animation.from) * ease);
        if (progress >= 1) {
          writePosition(animation.target);
          animation = null;
          phase("settled");
          return;
        }
      }
      animationFrame = requestAnimationFrame(tick);
    };

    const animateTo = (target: number, kind: "snap" | "return" = "snap") => {
      cancelAnimation();
      const from = window.scrollY;
      expectedY = from;
      if (reduced || Math.abs(target - from) <= 1) {
        writePosition(target);
        phase("settled");
        return;
      }
      animation = {
        kind, from, target, since: performance.now(),
        duration: kind === "return" ? 340 : Math.min(780, Math.max(500, 360 + Math.abs(target - from) * 0.35)),
      };
      phase(kind === "return" ? "returning" : "snapping");
      animationFrame = requestAnimationFrame(tick);
    };

    const previewTo = (target: number) => {
      if (reduced) return;
      if (animation?.kind === "preview") animation.target = target;
      else {
        cancelAnimation();
        expectedY = window.scrollY;
        animation = { kind: "preview", from: window.scrollY, target, since: 0, duration: 0 };
      }
      if (!animationFrame) animationFrame = requestAnimationFrame(tick);
    };

    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      frame = Math.max(1, window.innerHeight - headerOffset);
      const sections = [...document.querySelectorAll<HTMLElement>("main > section.chapter")];
      const next = getSectionStops(
        sections.map((section) => {
          const bounds = section.getBoundingClientRect();
          const margin = parseFloat(getComputedStyle(section).scrollMarginTop);
          return {
            top: bounds.top + window.scrollY,
            height: bounds.height,
            scrollMarginTop: Number.isFinite(margin) ? margin : headerOffset,
          };
        }),
        window.innerHeight, headerOffset, root.scrollHeight,
      );
      const changed = next.length !== stops.length || next.some((stop, index) => Math.abs(stop - stops[index]) > 1);
      stops = next;
      root.dataset.pagingStops = String(stops.length);
      if (changed && (animation || nativeBoundary || gesture)) {
        // Expanding a report changes downstream stops. Re-measure without moving the reader.
        cancelAnimation();
        gesture = null;
        nativeBoundary = null;
        inputMode = "external";
        externalUntil = performance.now() + 450;
        phase("ready");
      }
    };

    const queueMeasure = () => {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure);
    };

    const clearSettling = () => {
      window.clearTimeout(settleTimer);
      window.clearTimeout(wheelTimer);
    };

    const suspend = (duration = 750) => {
      cancelAnimation();
      clearSettling();
      gesture = null;
      nativeBoundary = null;
      inputMode = "external";
      externalUntil = performance.now() + duration;
      phase("ready");
    };

    const scheduleNativeSettle = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (pointerDown || touchDown || animation || performance.now() < externalUntil) return;
        if (inputMode === "touch" && !touchMoved) return;
        if (inputMode !== "touch" && inputMode !== "free") return;
        // Only a heading approached by this input can attract it. Moving away from a long
        // chapter's opening must not repeatedly pull the reader backwards to that opening.
        const touchDirection = window.scrollY > touchOrigin ? 1 : -1;
        const target = inputMode === "touch"
          ? adjacentStop(stops, touchOrigin, touchDirection)
          : nativeBoundary?.target;
        inputMode = "external";
        nativeBoundary = null;
        if (target === undefined || Math.abs(target - window.scrollY) > 180) return;
        animateTo(target);
      }, 190);
    };

    const onScroll = () => {
      if (animation) {
        // A native anchor, focus move or external scroll may interrupt our RAF animation.
        if (Math.abs(window.scrollY - expectedY) > 4) suspend(550);
        else return;
      }
      if (inputMode === "free" && nativeBoundary) {
        const crossed = nativeBoundary.direction > 0
          ? window.scrollY > nativeBoundary.target + 2
          : window.scrollY < nativeBoundary.target - 2;
        if (crossed) {
          // A non-cancelable inertia tail may cross its first heading; never let it skip two.
          const { target, direction } = nativeBoundary;
          nativeBoundary = null;
          gesture = { direction, energy: 100, lastEvent: performance.now(), committed: true, reverseEnergy: 0 };
          inputMode = "wheel";
          root.dataset.pagingTarget = String(Math.round(target));
          writePosition(target);
          phase("settled");
          return;
        }
      }
      if (inputMode === "touch" && Math.abs(window.scrollY - touchOrigin) > 12) touchMoved = true;
      if (inputMode === "touch" || inputMode === "free") scheduleNativeSettle();
    };

    const onWheel = (event: WheelEvent) => {
      const vertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || !vertical || !event.deltaY || pointerDown
        || closestControl(event.target, wheelControls) || nestedScroller(event.target, event.deltaY)) {
        if (animation) suspend();
        return;
      }
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 18
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? frame : 1;
      const delta = event.deltaY * unit;
      const direction = delta > 0 ? 1 : -1;
      const threshold = Math.min(90, Math.max(55, frame * 0.1));
      const now = performance.now();
      root.dataset.pagingWheelDelta = String(delta);

      if (gesture?.committed && (animation || now - gesture.lastEvent <= 230)) {
        const tail = accumulateWheel(gesture, delta, now, threshold, Boolean(animation));
        if (!tail.fresh) {
          root.dataset.pagingRoute = "inertia";
          gesture = tail.gesture;
          if (event.cancelable) event.preventDefault();
          else {
            cancelAnimation();
            const lockedTarget = Number(root.dataset.pagingTarget);
            nativeBoundary = { target: Number.isFinite(lockedTarget) ? lockedTarget : window.scrollY, direction: gesture.direction };
            inputMode = "free";
          }
          return;
        }
        cancelAnimation();
        gesture = null;
      }

      const nextHeading = adjacentStop(stops, window.scrollY, direction);
      root.dataset.pagingCandidate = String(nextHeading);
      if (!event.cancelable) {
        root.dataset.pagingRoute = "native-sequence";
        // Some browsers cannot cancel the later events in a wheel sequence; let them scroll.
        cancelAnimation();
        gesture = null;
        nativeBoundary = { target: nextHeading, direction };
        inputMode = "free";
        externalUntil = 0;
        scheduleNativeSettle();
        return;
      }

      const captureHeading = shouldCaptureHeading(
        window.scrollY, nextHeading, nearestStop(stops, window.scrollY), window.innerHeight, delta,
      );
      if (!captureHeading) {
        root.dataset.pagingRoute = "reading";
        // Read the middle of a long chapter with the browser's native wheel/trackpad motion.
        cancelAnimation();
        clearSettling();
        gesture = null;
        nativeBoundary = { target: nextHeading, direction };
        inputMode = "free";
        externalUntil = 0;
        phase("reading");
        return;
      }

      event.preventDefault();
      root.dataset.pagingRoute = "capture";
      clearSettling();
      inputMode = "wheel";
      nativeBoundary = null;
      externalUntil = 0;
      const locked = animation?.kind === "snap";
      const result = accumulateWheel(gesture, delta, now, threshold, locked);
      if (result.fresh) {
        cancelAnimation();
        origin = window.scrollY;
      }
      gesture = result.gesture;
      const target = adjacentStop(stops, origin, gesture.direction);

      if (result.commit) {
        root.dataset.pagingTarget = String(Math.round(target));
        animateTo(target);
      } else if (!gesture.committed) {
        const progress = Math.min(1, gesture.energy / threshold);
        const distance = Math.abs(target - origin);
        const displacement = Math.min(86, distance * 0.13) * progress;
        phase("damping", gesture.direction * progress);
        previewTo(origin + gesture.direction * displacement);
      }

      // Keep every same-direction inertia event within the original committed gesture.
      wheelTimer = window.setTimeout(() => {
        if (gesture && !gesture.committed) animateTo(origin, "return");
      }, 240);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (closestControl(event.target, keyboardControls)) {
        if (animation) suspend();
        return;
      }
      const direction = event.key === "PageDown" || (event.code === "Space" && !event.shiftKey) ? 1
        : event.key === "PageUp" || (event.code === "Space" && event.shiftKey) ? -1 : 0;
      if (!direction) {
        if (["ArrowUp", "ArrowDown", "Home", "End", "Escape"].includes(event.key)) suspend();
        return;
      }
      event.preventDefault();
      if (event.repeat) return;
      suspend(0);
      const heading = adjacentStop(stops, window.scrollY, direction);
      const target = Math.abs(heading - window.scrollY) <= window.innerHeight + 12
        ? heading : window.scrollY + direction * frame;
      root.dataset.pagingTarget = String(Math.round(target));
      animateTo(target);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerDown = true;
      suspend();
    };
    const onPointerUp = () => { pointerDown = false; };
    const onTouchStart = (event: TouchEvent) => {
      cancelAnimation();
      clearSettling();
      gesture = null;
      nativeBoundary = null;
      touchDown = true;
      touchMoved = false;
      touchOrigin = window.scrollY;
      const element = event.target instanceof Element ? event.target : null;
      const action = element ? getComputedStyle(element).touchAction : "auto";
      const widgetGesture = action === "none" || action === "pan-x" || closestControl(event.target, wheelControls);
      inputMode = widgetGesture ? "external" : "touch";
      externalUntil = widgetGesture ? performance.now() + 750 : 0;
      phase("ready");
    };
    const onTouchEnd = (event: TouchEvent) => {
      touchDown = event.touches.length > 0;
      if (!touchDown && inputMode === "touch") scheduleNativeSettle();
    };
    const onClick = (event: MouseEvent) => {
      if (closestControl(event.target, keyboardControls)) suspend();
    };
    const onHashChange = () => { suspend(1000); queueMeasure(); };
    const onBlur = () => { pointerDown = false; touchDown = false; suspend(); };

    measure();
    phase("ready");
    const observer = new ResizeObserver(queueMeasure);
    observer.observe(root);
    document.querySelectorAll("main, main > section.chapter").forEach((element) => observer.observe(element));
    const calibrationObserver = new MutationObserver(queueMeasure);
    document.querySelectorAll("main > section.chapter").forEach((element) => {
      calibrationObserver.observe(element, { attributes: true, attributeFilter: ["data-page-inset"] });
    });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", queueMeasure);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    window.addEventListener("pointerup", onPointerUp, { capture: true, passive: true });
    window.addEventListener("pointercancel", onPointerUp, { capture: true, passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("click", onClick, true);

    return () => {
      disposed = true;
      cancelAnimation();
      clearSettling();
      if (measureFrame) cancelAnimationFrame(measureFrame);
      observer.disconnect();
      calibrationObserver.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", queueMeasure);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("pointercancel", onPointerUp, true);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("click", onClick, true);
      delete root.dataset.paging;
      delete root.dataset.pagingStops;
      delete root.dataset.pagingTarget;
      delete root.dataset.pagingWheelDelta;
      delete root.dataset.pagingRoute;
      delete root.dataset.pagingCandidate;
      root.style.removeProperty("--paging-progress");
    };
  }, [enabled, reduced, headerOffset]);
}
