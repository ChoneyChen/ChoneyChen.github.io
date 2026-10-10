import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

export const SCENE_PREWARM_PX = 160;
export const SCENE_EXIT_HOLD_MS = 120;

type Bounds = Pick<DOMRectReadOnly, "top" | "right" | "bottom" | "left">;

/** Use geometric overlap, never a ratio that changes when a disclosure grows. */
export function sceneInPrewarmZone(scene: Bounds, viewport: Bounds, prewarm = SCENE_PREWARM_PX) {
  return scene.right > scene.left && scene.bottom > scene.top
    && scene.right > viewport.left && scene.left < viewport.right
    && scene.bottom > viewport.top - prewarm && scene.top < viewport.bottom + prewarm;
}

type TimerScheduler = {
  delay: (callback: () => void, milliseconds: number) => number;
  cancel: (handle: number) => void;
};

/** A delayed exit may be cancelled, but entry never waits for a timer. */
export function createScenePresenceController({
  initial = false,
  once = false,
  hold = SCENE_EXIT_HOLD_MS,
  scheduler,
  onChange,
  confirmExit = () => true,
}: {
  initial?: boolean;
  once?: boolean;
  hold?: number;
  scheduler: TimerScheduler;
  onChange: (present: boolean) => void;
  confirmExit?: () => boolean;
}) {
  let present = initial;
  let intersects = initial;
  let timer: number | null = null;
  let disposed = false;
  const cancelExit = () => {
    if (timer !== null) scheduler.cancel(timer);
    timer = null;
  };
  const change = (next: boolean) => {
    if (disposed || next === present) return;
    present = next;
    onChange(next);
  };
  return {
    observe(inside: boolean) {
      if (disposed) return;
      intersects = inside;
      if (inside) {
        cancelExit();
        change(true);
      } else if (present && !once && timer === null) {
        timer = scheduler.delay(() => {
          timer = null;
          if (disposed || intersects) return;
          // The element may have returned before a delayed observer callback is delivered.
          if (!confirmExit()) { intersects = true; return; }
          change(false);
        }, hold);
      }
    },
    dispose() { disposed = true; cancelExit(); },
  };
}

export type ScenePresenceOptions = {
  once?: boolean;
  initial?: boolean;
  /** Accepted for migration from Motion useInView; presence does not depend on area. */
  amount?: "some" | "all" | number;
  root?: RefObject<Element | null>;
  prewarm?: number;
  exitHold?: number;
};

const useInitialPresence = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Observe a stable, unanimated scene wrapper. Start its entrance 160px before it
 * reaches the viewport and retain it through partial visibility. Only 120ms spent
 * wholly outside that same band starts the reverse/reset animation. Quick reversals
 * cancel exit; full departures re-arm entrance without keys or component remounts.
 */
export function useScenePresence(
  ref: RefObject<Element | null>,
  { once = false, initial = false, root, prewarm = SCENE_PREWARM_PX, exitHold = SCENE_EXIT_HOLD_MS }: ScenePresenceOptions = {},
) {
  const [present, setPresent] = useState(initial);
  const presentRef = useRef(initial);

  useInitialPresence(() => {
    const node = ref.current;
    if (!node || (once && presentRef.current)) return;
    const rootNode = root?.current ?? null;
    const inBand = () => {
      const viewport = rootNode?.getBoundingClientRect() ?? {
        top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth,
      };
      return sceneInPrewarmZone(node.getBoundingClientRect(), viewport, prewarm);
    };
    const controller = createScenePresenceController({
      initial: presentRef.current,
      once,
      hold: exitHold,
      scheduler: {
        delay: (callback, milliseconds) => window.setTimeout(callback, milliseconds),
        cancel: (handle) => window.clearTimeout(handle),
      },
      onChange: (next) => { presentRef.current = next; setPresent(next); },
      confirmExit: () => !inBand(),
    });
    // One initial read handles reloads/deep links without waiting for the first IO batch.
    controller.observe(inBand());
    if (typeof IntersectionObserver === "undefined") {
      controller.observe(true);
      return () => controller.dispose();
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === node) controller.observe(entry.isIntersecting);
      }
    }, {
      root: rootNode,
      rootMargin: `${prewarm}px 0px ${prewarm}px 0px`,
      threshold: 0,
    });
    observer.observe(node);
    return () => { observer.disconnect(); controller.dispose(); };
  }, [ref, root, once, prewarm, exitHold]);

  return present;
}
