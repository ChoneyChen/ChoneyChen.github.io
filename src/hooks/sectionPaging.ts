export type SectionGeometry = { top: number; height: number; scrollMarginTop?: number };

/** Chapter headings calibrated with their own scroll margin; long chapters remain continuous. */
export function getSectionStops(
  sections: SectionGeometry[],
  viewportHeight: number,
  headerOffset: number,
  documentHeight: number,
): number[] {
  const maximum = Math.max(0, documentHeight - viewportHeight);
  const positions = [0, maximum];

  for (const section of sections) {
    positions.push(section.top - (section.scrollMarginTop ?? headerOffset));
  }

  return positions
    .map((position) => Math.min(maximum, Math.max(0, position)))
    .sort((a, b) => a - b)
    .reduce<number[]>((unique, position) => {
      if (!unique.length || position - unique[unique.length - 1] > 2) unique.push(position);
      return unique;
    }, []);
}

export function nearestStop(stops: number[], position: number): number {
  return stops.reduce(
    (closest, stop) => Math.abs(stop - position) < Math.abs(closest - position) ? stop : closest,
    stops[0] ?? position,
  );
}

export function adjacentStop(stops: number[], position: number, direction: 1 | -1): number {
  return direction === 1
    ? (stops.find((stop) => stop > position + 3) ?? stops[stops.length - 1] ?? position)
    : ([...stops].reverse().find((stop) => stop < position - 3) ?? stops[0] ?? position);
}

export function shouldCaptureHeading(
  position: number,
  heading: number,
  closest: number,
  viewportHeight: number,
  delta: number,
): boolean {
  const distance = Math.abs(heading - position);
  const shortChapter = Math.abs(closest - position) <= 32 && distance <= viewportHeight + 12;
  return distance <= 180 || shortChapter || Math.abs(delta) >= distance - 180;
}

export type WheelGesture = {
  direction: 1 | -1;
  energy: number;
  lastEvent: number;
  committed: boolean;
  reverseEnergy: number;
};

/** One threshold crossing per gesture; small opposite tail noise cannot reverse a page. */
export function accumulateWheel(
  previous: WheelGesture | null,
  delta: number,
  now: number,
  threshold: number,
  locked = false,
): { gesture: WheelGesture; fresh: boolean; commit: boolean } {
  const direction = delta > 0 ? 1 : -1;
  const amount = Math.abs(delta);
  const gap = previous ? now - previous.lastEvent : Infinity;
  let fresh = !previous || (gap > 230 && !locked);

  if (previous && !fresh && direction !== previous.direction) {
    const reverseEnergy = previous.reverseEnergy + amount;
    if (previous.committed && reverseEnergy < 24) {
      return {
        gesture: { ...previous, reverseEnergy, lastEvent: now },
        fresh: false,
        commit: false,
      };
    }
    fresh = true;
  }

  const gesture: WheelGesture = fresh
    ? { direction, energy: amount, lastEvent: now, committed: false, reverseEnergy: 0 }
    : {
        ...previous!,
        energy: previous!.committed ? previous!.energy : previous!.energy + amount,
        lastEvent: now,
        reverseEnergy: 0,
      };
  const commit = !gesture.committed && gesture.energy >= threshold;
  if (commit) gesture.committed = true;
  return { gesture, fresh, commit };
}
