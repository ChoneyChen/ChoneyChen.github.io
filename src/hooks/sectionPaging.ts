export type SectionGeometry = { top: number; height: number; scrollMarginTop?: number };
export type SectionStop = { position: number; top: number };

/** Only real, reachable chapter headings. The document end is not an extra snap target. */
export function getSectionStops(
  sections: SectionGeometry[],
  viewportHeight: number,
  headerOffset: number,
  documentHeight: number,
): SectionStop[] {
  const maximum = Math.max(0, documentHeight - viewportHeight);
  return sections
    .map((section) => ({ position: section.top - (section.scrollMarginTop ?? headerOffset), top: section.top }))
    .filter(({ position }) => Number.isFinite(position) && position >= 0 && position < maximum - 1)
    .sort((a, b) => a.position - b.position)
    .reduce<SectionStop[]>((unique, stop) => {
      if (!unique.length || stop.position - unique[unique.length - 1].position > 2) unique.push(stop);
      return unique;
    }, []);
}

export function getReleaseRadius(viewportHeight: number): number {
  return Math.max(0, viewportHeight * 0.5);
}

/** Fast nearby corrections, with more travel time for a half-screen transition. */
export function getReleaseDuration(distance: number): number {
  return 220 + Math.min(180, Math.abs(distance) * 0.4);
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
  viewportHeight: number;
};

/** The real chapter top must cross the half-screen line; calibration only sets its destination. */
export function selectReleaseTarget(stops: SectionStop[], { origin, position, direction, viewportHeight }: ReleasePosition): number | null {
  if (!direction || direction * (position - origin) < 0.5) return null;
  let closest: number | null = null;
  let distance = Infinity;
  const radius = getReleaseRadius(viewportHeight);
  const overshootAllowance = Math.min(88, Math.max(56, viewportHeight * 0.09));
  for (const stop of stops) {
    const remaining = Math.abs(stop.position - position);
    const initial = Math.abs(stop.position - origin);
    if (direction * (stop.position - origin) <= 12) continue;
    const ahead = direction * (stop.position - position);
    // A passed opening only receives a small correction, never a half-screen pull backwards.
    if (ahead < 0 ? remaining > overshootAllowance : direction * (stop.top - position) > radius) continue;
    if (remaining < 0.5 || remaining > distance || remaining >= initial - 0.25) continue;
    closest = stop.position;
    distance = remaining;
  }
  return closest;
}

export type ReleaseReadiness = {
  now: number;
  lastInput: number;
  lastScroll: number;
  held: boolean;
  reduced: boolean;
  nativeScrollEnd: boolean;
  nativeEnded: boolean;
};

/** Native scrollend is authoritative; the old-browser fallback deliberately waits longer. */
export function canSettleAfterRelease(state: ReleaseReadiness): boolean {
  if (state.held || state.reduced) return false;
  return state.nativeScrollEnd
    ? state.nativeEnded
    : state.now - state.lastScroll >= 380 && state.now - state.lastInput >= 300;
}

export type ReleaseAnimation = {
  from: number;
  target: number;
  since: number;
  duration: number;
  inputVersion: number;
};

/** Zero-bounce spring from rest; an almost invisible Hermite tail reaches exact rest continuously.
 * Apple WWDC23 "Animate with springs" motivates continuous position/velocity and natural settling.
 * The tail is our own C2 interpolation, not Apple's implementation. duration tunes the response.
 */
export function sampleReleaseAnimation(animation: ReleaseAnimation, now: number, inputVersion: number): { position: number; velocity: number; progress: number; done: boolean } | null {
  if (animation.inputVersion !== inputVersion) return null;
  const seconds = Math.max(0, now - animation.since) / 1000;
  const omega = 9 / (Math.max(1, animation.duration) / 1000);
  const phase = omega * seconds;
  const offset = animation.from - animation.target;
  if (offset === 0 || phase >= 11) {
    return { position: animation.target, velocity: 0, progress: 1, done: true };
  }
  if (phase < 9) {
    const decay = Math.exp(-phase);
    const remaining = offset * (1 + phase) * decay;
    const velocity = phase === 0 ? 0 : -offset * omega * phase * decay;
    return { position: animation.target + remaining, velocity, progress: 1 - (1 + phase) * decay, done: false };
  }
  // Join at q=9; D=2/omega gives the same position, velocity AND acceleration.
  // P(0)=0, P'(0)=1.8, P''(0)=-3.2; P(1)=1, P'(1)=P''(1)=0.
  // P' stays nonnegative and P'' nonpositive, so the tail only decelerates and never bounces.
  const s = (phase - 9) / 2;
  const rest = 1 - s;
  // Factored forms avoid cancellation close to s=1 and keep the residual/velocity nonnegative.
  const residual = rest ** 3 * (1 + 1.2 * s + 2.2 * s * s);
  const derivative = rest ** 2 * (1.8 + 0.4 * s + 11 * s * s);
  const tailDecay = 10 * Math.exp(-9);
  const tailOffset = offset * tailDecay;
  return {
    position: animation.target + tailOffset * residual,
    velocity: -tailOffset * derivative * omega / 2,
    progress: 1 - tailDecay * residual,
    done: false,
  };
}
