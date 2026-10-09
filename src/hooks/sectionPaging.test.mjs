import assert from "node:assert/strict";
import test from "node:test";
import { advanceReadingProgress, canSettleAfterRelease, getReleaseRadius, getSectionStops, positionBeforeInput, sampleReleaseAnimation, selectReleaseTarget } from "./sectionPaging.ts";

test("only reachable chapter headings are targets, without an artificial document-end stop", () => {
  assert.deepEqual(getSectionStops([
    { top: 78, height: 822 }, { top: 900, height: 1644 }, { top: 2544, height: 822 },
  ], 900, 78, 3486), [0, 822, 2466]);
  assert.deepEqual(getSectionStops([{ top: 78, height: 2200 }], 900, 78, 2600), [0]);
  assert.deepEqual(getSectionStops([{ top: 0, height: 100 }], 900, 78, 100), []);
});

test("chapter-specific margins use the same alignment as native fragment navigation", () => {
  assert.deepEqual(getSectionStops([
    { top: 0, height: 800, scrollMarginTop: 0 },
    { top: 800, height: 1100, scrollMarginTop: 48 },
    { top: 1900, height: 1500, scrollMarginTop: -12 },
    { top: 3520, height: 100, scrollMarginTop: 0 },
  ], 800, 78, 3520), [0, 752, 1912]);
});

test("passive wheel input recovers real movement already applied by the compositor", () => {
  const observations = [{ position: 9612, at: 10 }, { position: 9641, at: 20 }];
  const origin = positionBeforeInput(observations, 30, 10749.5);
  assert.equal(origin, 9641);
  const progress = advanceReadingProgress({ origin, lastPosition: origin, direction: 0 }, 10749.5);
  assert.equal(progress.direction, 1);
  assert.equal(selectReleaseTarget([10811.14], { ...progress, position: 10749.5, radius: 64.8 }), 10811.14);
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
  selectReleaseTarget(stops, { origin, position, direction, radius: 72 });

test("long reading positions and tiny departures never force a page turn or return to the origin", () => {
  assert.equal(target(0, 35, 1), null);
  assert.equal(target(752, 785, 1), null);
  assert.equal(target(752, 716, -1), null);
  assert.equal(target(745, 784, 1), null);
  assert.equal(target(0, 640, 1), null);
  assert.equal(target(752, 1430, 1), null);
});

test("only a nearby heading approached in the real scroll direction can settle", () => {
  assert.equal(target(500, 720, 1), 752);
  assert.equal(target(500, 806, 1), 752);
  assert.equal(target(1000, 790, -1), 752);
  assert.equal(target(1000, 712, -1), 752);
  assert.equal(target(900, 940, 1), null);
  assert.equal(target(900, 790, 1), null);
  assert.equal(target(700, 808, 1), null); // Already farther away after passing it.
  assert.equal(target(700, 752, 1), null); // Already precisely aligned; no extra movement.
});

test("native input may cross several chapters; selection follows its endpoint", () => {
  assert.equal(target(0, 1950, 1), 2000);
  assert.equal(target(3200, 790, -1), 752);
  assert.equal(target(0, 3090, 1), 3100);
  assert.equal(target(0, 3090, 0), null);
});

test("the capture zone stays narrow across displays and cannot be widened beyond 88px", () => {
  assert.equal(getReleaseRadius(400), 56);
  assert.equal(getReleaseRadius(800), 72);
  assert.equal(getReleaseRadius(1600), 88);
  assert.equal(selectReleaseTarget([752], { origin: 0, position: 650, direction: 1, radius: 500 }), null);
});

const readiness = { now: 1000, lastInput: 700, lastScroll: 600, inputQuiet: 180,
  held: false, reduced: false, nativeScrollEnd: true, nativeEnded: true };

test("native inertia, held touch/pointer/keys, new wheel input, and reduced motion all postpone settlement", () => {
  assert.equal(canSettleAfterRelease(readiness), true);
  assert.equal(canSettleAfterRelease({ ...readiness, nativeEnded: false }), false);
  assert.equal(canSettleAfterRelease({ ...readiness, held: true }), false);
  assert.equal(canSettleAfterRelease({ ...readiness, lastInput: 950 }), false);
  assert.equal(canSettleAfterRelease({ ...readiness, lastScroll: 980 }), false);
  assert.equal(canSettleAfterRelease({ ...readiness, reduced: true }), false);
});

test("older browsers require both prolonged scroll stillness and input silence", () => {
  const fallback = { ...readiness, nativeScrollEnd: false, nativeEnded: false };
  assert.equal(canSettleAfterRelease(fallback), true);
  assert.equal(canSettleAfterRelease({ ...fallback, lastScroll: 800 }), false);
  assert.equal(canSettleAfterRelease({ ...fallback, lastInput: 800 }), false);
});

test("release damping is monotonic in both directions and finishes exactly", () => {
  for (const [from, to] of [[720, 752], [806, 752]]) {
    const animation = { from, target: to, since: 100, duration: 350, inputVersion: 4 };
    assert.equal(sampleReleaseAnimation(animation, 100, 4).position, from);
    let previous = from;
    for (let time = 110; time < 450; time += 10) {
      const sample = sampleReleaseAnimation(animation, time, 4);
      assert.ok(sample.position >= Math.min(from, to) && sample.position <= Math.max(from, to));
      assert.ok((to - from) * (sample.position - previous) >= 0);
      previous = sample.position;
    }
    assert.deepEqual(sampleReleaseAnimation(animation, 450, 4), { position: to, progress: 1, done: true });
  }
});

test("any new input generation cancels the next frame, without a stale final jump", () => {
  const animation = { from: 720, target: 752, since: 100, duration: 350, inputVersion: 4 };
  assert.equal(sampleReleaseAnimation(animation, 200, 5), null);
  assert.equal(sampleReleaseAnimation(animation, 450, 5), null);
});
