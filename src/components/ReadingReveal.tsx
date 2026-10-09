import { motion, usePresence, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type ReadingRevealProps = Omit<HTMLMotionProps<"div">, "children"> & { children: ReactNode };

/**
 * Intrinsic disclosure sizing through grid tracks, without Motion's height:auto
 * measurement pass (which temporarily restores scroll and can cancel native scrolling).
 * The original class stays on the content so its direct-child styles remain intact.
 */
export function ReadingReveal({ className, children, initial, animate, exit, ...props }: ReadingRevealProps) {
  const [isPresent, safeToRemove] = usePresence();
  const [collapsing, setCollapsing] = useState(false);
  const activity = useRef(false);
  const leaving = useRef(!isPresent);
  leaving.current = !isPresent;

  useEffect(() => {
    let quietTimer = 0;
    const nativeEnd = "onscrollend" in document;
    const finish = (event?: Event) => {
      if (event && event.target !== document) return;
      activity.current = false;
      if (leaving.current) setCollapsing(true);
    };
    const scrolling = () => {
      activity.current = true;
      if (!nativeEnd) {
        window.clearTimeout(quietTimer);
        quietTimer = window.setTimeout(finish, 250);
      }
    };
    window.addEventListener("scroll", scrolling, { passive: true });
    document.addEventListener("scrollend", finish);
    return () => {
      window.removeEventListener("scroll", scrolling);
      document.removeEventListener("scrollend", finish);
      window.clearTimeout(quietTimer);
    };
  }, []);

  useEffect(() => {
    if (isPresent) setCollapsing(false);
    else if (!activity.current) setCollapsing(true);
  }, [isPresent]);

  // Fade immediately when leaving, but keep the occupied space until native scrolling
  // finishes. Shrinking an earlier chapter mid-gesture invalidates a native hash target.
  const target = isPresent
    ? { gridTemplateRows: "1fr", ...(typeof animate === "object" ? animate : {}) }
    : { ...(typeof exit === "object" ? exit : {}), gridTemplateRows: collapsing ? "0fr" : "1fr" };
  return (
    <motion.div
      {...props}
      data-reading-reveal
      data-reveal-state={isPresent ? "open" : collapsing ? "collapsing" : "waiting-for-scroll"}
      inert={!isPresent}
      style={{ display: "grid", ...props.style }}
      initial={initial === false ? false : { gridTemplateRows: "0fr", ...(typeof initial === "object" ? initial : {}) }}
      animate={target}
      onAnimationComplete={(definition) => {
        props.onAnimationComplete?.(definition);
        if (!isPresent && collapsing) safeToRemove?.();
      }}
    >
      <div style={{ minHeight: 0, overflow: "hidden" }}>
        <div className={className}>{children}</div>
      </div>
    </motion.div>
  );
}
