import assert from "node:assert/strict";
import test from "node:test";
import { advanceReadingProgress, canSettleAfterRelease, getReleaseDuration, getReleaseRadius, getSectionStops, positionBeforeInput, sampleReleaseAnimation, selectReleaseTarget } from "./sectionPaging.ts";

const positions = (stops) => stops.map((stop) => stop.position);
const headings = (stops) => stops.map((position) => ({ position, top: position }));

test("only reachable chapter headings are targets, without an artificial document-end stop", () => {
  assert.deepEqual(positions(getSectionStops([
    { top: 78, height: 822 }, { top: 900, height: 1644 }, { top: 2544, height: 822 },
  ], 900, 78, 3486)), [0, 822, 2466]);
  assert.deepEqual(positions(getSectionStops([{ top: 78, height: 2200 }], 900, 78, 2600)), [0]);
  assert.deepEqual(getSectionStops([{ top: 0, height: 100 }], 900, 78, 100), []);
});

test("chapter-specific margins use the same alignment as native fragment navigation", () => {
  assert.deepEqual(positions(getSectionStops([
    { top: 0, height: 800, scrollMarginTop: 0 },
    { top: 800, height: 1100, scrollMarginTop: 48 },
    { top: 1900, height: 1500, scrollMarginTop: -12 },
    { top: 3520, height: 100, scrollMarginTop: 0 },
  ], 800, 78, 3520)), [0, 752, 1912]);
});

test("passive wheel input recovers real movement already applied by the compositor", () => {
  const observations = [{ position: 9612, at: 10 }, { position: 9641, at: 20 }];
  const origin = positionBeforeInput(observations, 30, 10749.5);
  assert.equal(origin, 9641);
  const progress = advanceReadingProgress({ origin, lastPosition: origin, direction: 0 }, 10749.5);
  assert.equal(progress.direction, 1);
  assert.equal(selectReleaseTarget([{ position: 10811.14, top: 10800.14 }], { ...progress, position: 10749.5, viewportHeight: 720 }), 10811.14);
});

test("a scroll observation delivered before a delayed wheel callback still preserves the input's origin", () => {
  const observations = [{ position: 9641, at: 20 }, { position: 10749.5, at: 35 }];
  assert.equal(positionBeforeInput(observations, 30, 10749.5), 9641);
  assert.equal(positionBeforeInput(observations, 40, 10749.5), 10749.5);
});

test("real reversal resets the approach origin and a zero-delta scroll does not erase its direction", () => {
  const down = advanceReadingProgress({ origin: 500, lastPosition: 720, direction: 1 }, 800);
  const reverse = advanceReadingProgress(down, 790);
  assert.deepEqual(reverse, { origin: 800, lastPosition: 790, direction: -1 });
  assert.equal(advanceReadingProgress(reverse, 790), reverse);
});

const target = (origin, position, direction, stops = [0, 752, 2000, 3100]) =>
  selectReleaseTarget(headings(stops), { origin, position, direction, viewportHeight: 800 });

test("long reading positions and tiny departures never force a page turn or return to the origin", () => {
  assert.equal(target(0, 35, 1), null);
  assert.equal(target(752, 785, 1), null);
  assert.equal(target(752, 716, -1), null);
  assert.equal(target(745, 784, 1), null);
  assert.equal(target(0, 300, 1), null);
  assert.equal(target(752, 1430, 1), null);
});

test("a heading past half-screen approached in the real scroll direction can settle", () => {
  assert.equal(target(500, 720, 1), 752);
  assert.equal(target(500, 806, 1), 752);
  assert.equal(target(1000, 790, -1), 752);
  assert.equal(target(1000, 712, -1), 752);
  assert.equal(target(900, 940, 1), null);
  assert.equal(target(900, 790, 1), null);
  assert.equal(target(700, 808, 1), null); // Already farther away after passing it.
  assert.equal(target(700, 752, 1), null); // Already precisely aligned; no extra movement.
});

test("the exact half-screen trigger uses the real chapter top rather than its header-adjusted destination", () => {
  const stops = getSectionStops([{ top: 800, height: 1100, scrollMarginTop: 48 }], 800, 78, 3000);
  const state = { origin: 0, direction: 1, viewportHeight: 800 };
  assert.equal(selectReleaseTarget(stops, { ...state, position: 399.5 }), null);
  assert.equal(selectReleaseTarget(stops, { ...state, position: 400 }), 752);
  assert.equal(selectReleaseTarget(stops, { ...state, position: 401 }), 752);
  assert.equal(selectReleaseTarget(stops, { ...state, origin: 399, position: 400 }), 752); // A small final nudge crossing the line counts.
  const negativeMargin = [{ position: 811, top: 800 }];
  assert.equal(selectReleaseTarget(negativeMargin, { ...state, position: 400 }), 811);
});

test("the capture range scales with half of each viewport, including narrow and tall screens", () => {
  for (const viewportHeight of [400, 720, 844, 1600]) {
    assert.equal(getReleaseRadius(viewportHeight), viewportHeight / 2);
    const state = { origin: 0, direction: 1, viewportHeight };
    assert.equal(selectReleaseTarget(headings([2000]), { ...state, position: 2000 - viewportHeight / 2 - 1 }), null);
    assert.equal(selectReleaseTarget(headings([2000]), { ...state, position: 2000 - viewportHeight / 2 + 1 }), 2000);
  }
});

test("the wider entry range does not pull a passed heading back by half a screen", () => {
  assert.equal(target(0, 940, 1), null);
  assert.equal(target(1000, 550, -1), null);
  assert.equal(target(1000, 1100, 1), null); // Original heading is behind the gesture origin.
  assert.equal(target(752, 800, 1), null);
  assert.equal(target(752, 700, -1), null);
  assert.equal(target(1100, 1080, -1, [0, 2000, 3100]), null); // Long chapter interior.
});

test("native input may cross several chapters; selection follows its endpoint", () => {
  assert.equal(target(0, 1950, 1), 2000);
  assert.equal(target(3200, 790, -1), 752);
  assert.equal(target(0, 3090, 1), 3100);
  assert.equal(target(0, 3090, 0), null);
});

const readiness = { now: 1000, lastInput: 700, lastScroll: 600,
  held: false, reduced: false, nativeScrollEnd: true, nativeEnded: true };

test("native inertia, held touch/pointer/keys, new wheel input, and reduced motion all postpone settlement", () => {
  assert.equal(canSettleAfterRelease(readiness), true);
  assert.equal(canSettleAfterRelease({ ...readiness, nativeEnded: false }), false);
  assert.equal(canSettleAfterRelease({ ...readiness, held: true }), false);
  assert.equal(canSettleAfterRelease({ ...readiness, lastInput: 999, nativeEnded: false }), false);
  assert.equal(canSettleAfterRelease({ ...readiness, reduced: true }), false);
});

test("authoritative scrollend permits the next-frame handoff without a second wheel quiet period", () => {
  assert.equal(canSettleAfterRelease({ ...readiness, lastInput: 999, lastScroll: 999 }), true);
  assert.equal(canSettleAfterRelease({ ...readiness, lastInput: 999, lastScroll: 999, held: true }), false);
});

test("older browsers require both prolonged scroll stillness and input silence", () => {
  const fallback = { ...readiness, nativeScrollEnd: false, nativeEnded: false };
  assert.equal(canSettleAfterRelease(fallback), true);
  assert.equal(canSettleAfterRelease({ ...fallback, lastScroll: 800 }), false);
  assert.equal(canSettleAfterRelease({ ...fallback, lastInput: 800 }), false);
});

test("zero-bounce spring is monotonic in both directions, starts at rest, and ends at exact rest", () => {
  for (const [from, to] of [[720, 752], [806, 752], [400, 752], [1100, 752]]) {
    const animation = { from, target: to, since: 100, duration: getReleaseDuration(to - from), inputVersion: 4 };
    assert.deepEqual(sampleReleaseAnimation(animation, 100, 4), { position: from, velocity: 0, progress: 0, done: false });
    let previous = from;
    let lastSpeed = 0;
    let done = false;
    for (let time = 101; time < 1100; time += 1) {
      const sample = sampleReleaseAnimation(animation, time, 4);
      assert.ok(sample.position >= Math.min(from, to) && sample.position <= Math.max(from, to));
      assert.ok((to - from) * (sample.position - previous) >= 0);
      if (sample.done) {
        assert.ok(Math.abs(to - previous) <= 0.16);
        assert.ok(Math.abs(lastSpeed) <= 4.2);
        assert.equal(sample.position, to);
        assert.equal(sample.velocity, 0);
        done = true;
        break;
      }
      previous = sample.position;
      lastSpeed = sample.velocity;
    }
    assert.ok(done, "settles in finite time, without a visible final cutoff");
  }
});

test("a large movement continues its tail past tuning time instead of jumping to its destination", () => {
  const duration = getReleaseDuration(400);
  const sample = sampleReleaseAnimation({ from: 0, target: 400, since: 0, duration, inputVersion: 1 }, duration, 1);
  assert.equal(sample.done, false);
  assert.ok(sample.position < 400);
  assert.ok(sample.velocity > 4);
  assert.equal(getReleaseDuration(0), 220);
  assert.equal(getReleaseDuration(450), 400);
  assert.equal(getReleaseDuration(-450), 400);
});

test("spring, settling tail and exact rest preserve position and velocity, with matching tail acceleration", () => {
  for (const [from, target] of [[0, 400], [400, 0]]) {
    const duration = getReleaseDuration(target - from);
    const animation = { from, target, since: 100, duration, inputVersion: 1 };
    const dt = 0.0001; // milliseconds; compare both sides independently at the join.
    const join = animation.since + duration;
    const left = sampleReleaseAnimation(animation, join - dt, 1);
    const atJoin = sampleReleaseAnimation(animation, join, 1);
    const right = sampleReleaseAnimation(animation, join + dt, 1);
    assert.ok(Math.abs(left.position - right.position) < 0.0001);
    assert.ok(Math.abs(left.velocity - right.velocity) < 0.001);
    const accelerationBefore = (atJoin.velocity - left.velocity) / (dt / 1000);
    const accelerationAfter = (right.velocity - atJoin.velocity) / (dt / 1000);
    assert.ok(Math.abs(accelerationBefore - accelerationAfter) < 0.1);
    let lastSpeed = Math.abs(atJoin.velocity);
    const end = animation.since + duration * 11 / 9;
    for (let time = join + 0.5; time < end; time += 0.5) {
      const sample = sampleReleaseAnimation(animation, time, 1);
      assert.ok(Math.abs(sample.velocity) <= lastSpeed);
      lastSpeed = Math.abs(sample.velocity);
    }
    const beforeEnd = sampleReleaseAnimation(animation, end - dt, 1);
    assert.ok(Math.abs(beforeEnd.position - target) < 1e-8);
    assert.ok(Math.abs(beforeEnd.velocity) < 1e-8);
    const accelerationAtEnd = -beforeEnd.velocity / (dt / 1000);
    assert.ok(Math.abs(accelerationAtEnd) < 0.01);
    assert.deepEqual(sampleReleaseAnimation(animation, end + dt, 1), { position: target, velocity: 0, progress: 1, done: true });
  }
});

test("time-based spring samples do not depend on display frame rate or missing frames", () => {
  const animation = { from: 0, target: 360, since: 100, duration: getReleaseDuration(360), inputVersion: 2 };
  const at250 = sampleReleaseAnimation(animation, 250, 2);
  for (const time of [110, 116, 133, 149, 190]) sampleReleaseAnimation(animation, time, 2);
  assert.deepEqual(sampleReleaseAnimation(animation, 250, 2), at250);
  assert.deepEqual(sampleReleaseAnimation(animation, 3000, 2), { position: 360, velocity: 0, progress: 1, done: true });
});

test("any new input generation cancels the next frame, without a stale final jump", () => {
  const animation = { from: 720, target: 752, since: 100, duration: 350, inputVersion: 4 };
  assert.equal(sampleReleaseAnimation(animation, 200, 5), null);
  assert.equal(sampleReleaseAnimation(animation, 450, 5), null);
});
