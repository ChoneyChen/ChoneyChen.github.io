export type SectionGeometry = { top: number; height: number; scrollMarginTop?: number };

/** Only real, reachable chapter headings. The document end is not an extra snap target. */
export function getSectionStops(
  sections: SectionGeometry[],
  viewportHeight: number,
  headerOffset: number,
  documentHeight: number,
): number[] {
  const maximum = Math.max(0, documentHeight - viewportHeight);
  return sections
    .map((section) => section.top - (section.scrollMarginTop ?? headerOffset))
    .filter((position) => Number.isFinite(position) && position >= 0 && position < maximum - 1)
    .sort((a, b) => a - b)
    .reduce<number[]>((unique, position) => {
      if (!unique.length || position - unique[unique.length - 1] > 2) unique.push(position);
      return unique;
    }, []);
}

export function getReleaseRadius(viewportHeight: number): number {
  return Math.min(88, Math.max(56, viewportHeight * 0.09));
}

export type ObservedPosition = { position: number; at: number };

/** Passive input can arrive after compositor movement; recover its last observed starting point. */
export function positionBeforeInput(observations: ObservedPosition[], inputAt: number, fallback: number): number {
  for (let index = observations.length - 1; index >= 0; index -= 1) {
    if (observations[index].at <= inputAt) return observations[index].position;
  }
  return observations[0]?.position ?? fallback;
}

export type ReadingProgress = { origin: number; lastPosition: number; direction: -1 | 0 | 1 };

/** Direction comes from positions, including movement delivered before the passive wheel callback. */
export function advanceReadingProgress(previous: ReadingProgress, position: number): ReadingProgress {
  const delta = position - previous.lastPosition;
  if (Math.abs(delta) < 0.5) return previous;
  const direction = delta > 0 ? 1 : -1;
  const origin = previous.direction && direction !== previous.direction && Math.abs(delta) >= 2
    ? previous.lastPosition : previous.origin;
  return { origin, lastPosition: position, direction };
}

type ReleasePosition = {
  origin: number;
  position: number;
  direction: -1 | 0 | 1;
  radius: number;
};

/** A small finish near a heading the reader approached, never a pull back to their origin. */
export function selectReleaseTarget(stops: number[], { origin, position, direction, radius }: ReleasePosition): number | null {
  if (!direction || direction * (position - origin) < 6) return null;
  let closest: number | null = null;
  let distance = Math.min(88, Math.max(0, radius));
  for (const stop of stops) {
    const remaining = Math.abs(stop - position);
    const initial = Math.abs(stop - origin);
    if (direction * (stop - origin) <= 12) continue;
    if (remaining < 0.5 || remaining > distance || remaining >= initial - 3) continue;
    closest = stop;
    distance = remaining;
  }
  return closest;
}

export type ReleaseReadiness = {
  now: number;
  lastInput: number;
  lastScroll: number;
  inputQuiet: number;
  held: boolean;
  reduced: boolean;
  nativeScrollEnd: boolean;
  nativeEnded: boolean;
};

/** Native scrollend is authoritative; the old-browser fallback deliberately waits longer. */
export function canSettleAfterRelease(state: ReleaseReadiness): boolean {
  if (state.held || state.reduced) return false;
  if (state.now - state.lastInput < state.inputQuiet) return false;
  return state.nativeScrollEnd
    ? state.nativeEnded && state.now - state.lastScroll >= 32
    : state.now - state.lastScroll >= 380 && state.now - state.lastInput >= 300;
}

export type ReleaseAnimation = {
  from: number;
  target: number;
  since: number;
  duration: number;
  inputVersion: number;
};

/** Normalized critical damping: monotonic, no overshoot, and an exact finite endpoint. */
export function sampleReleaseAnimation(animation: ReleaseAnimation, now: number, inputVersion: number): { position: number; progress: number; done: boolean } | null {
  if (animation.inputVersion !== inputVersion) return null;
  const progress = Math.max(0, Math.min(1, (now - animation.since) / animation.duration));
  if (progress >= 1) return { position: animation.target, progress: 1, done: true };
  const damping = 7;
  const ease = (1 - (1 + damping * progress) * Math.exp(-damping * progress)) / (1 - (1 + damping) * Math.exp(-damping));
  return { position: animation.from + (animation.target - animation.from) * ease, progress, done: false };
}
