import type { CSSProperties } from "react";
import type { SpringOptions, Transition } from "motion/react";

/** Playback speed for presentation motion. Human-controlled coordinates stay unscaled. */
export const PRESENTATION_SPEED = 0.6;

export const motionTimingStyle = {
  "--motion-time-scale": 1 / PRESENTATION_SPEED,
} as CSSProperties;

/** Convert an existing time, in either seconds or milliseconds, without changing its unit. */
export const presentationTime = (time: number) => time / PRESENTATION_SPEED;

const timeFields = new Set([
  "duration", "visualDuration", "delay", "repeatDelay", "delayChildren",
  "staggerChildren", "timeConstant", "elapsed",
]);
const forceFields = new Set(["stiffness", "bounceStiffness"]);
const velocityFields = new Set(["damping", "bounceDamping", "velocity", "restSpeed"]);

function scaleTiming<T extends object>(configuration: T): T {
  const result: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(configuration)) {
    if (typeof value === "number") {
      result[name] = timeFields.has(name)
        ? presentationTime(value)
        : forceFields.has(name)
          ? value * PRESENTATION_SPEED ** 2
          : velocityFields.has(name)
            ? value * PRESENTATION_SPEED
            : value;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      // Motion permits per-value and layout transitions inside a transition.
      result[name] = scaleTiming(value);
    } else {
      // Normalised keyframe times, easings, repeat counts and callbacks keep their meaning.
      result[name] = value;
    }
  }
  const physics = configuration as Record<string, unknown>;
  if (["stiffness", "damping", "mass"].some((field) => typeof physics[field] === "number")) {
    // Explicit physics takes precedence over duration/bounce in Motion. Scale its
    // implicit coefficients, but retain Motion's amplitude-aware default stop speed.
    result.stiffness ??= 100 * PRESENTATION_SPEED ** 2;
    result.damping ??= 10 * PRESENTATION_SPEED;
  }
  return result as T;
}

/** Scale only at the Motion prop boundary, so shared transition objects cannot scale twice. */
export function slowMotion<T extends Transition>(transition: T): T {
  return scaleTiming(transition);
}

export function slowSpring(spring: SpringOptions): SpringOptions {
  return scaleTiming(spring);
}

/** Motion's installed drag-release defaults; the pointer/drag mapping is deliberately untouched. */
export const slowDragRelease = slowMotion({
  bounceStiffness: 200,
  bounceDamping: 40,
  timeConstant: 750,
  restDelta: 1,
  restSpeed: 10,
});

/** Same exponential response at 60/120 Hz, with a time-stretched automatic animation. */
export function presentationBlend(alphaAt60Hz: number, elapsedSeconds: number) {
  return -Math.expm1(Math.log1p(-alphaAt60Hz) * 60 * elapsedSeconds * PRESENTATION_SPEED);
}
