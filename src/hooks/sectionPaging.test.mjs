import assert from "node:assert/strict";
import test from "node:test";
import { accumulateWheel, adjacentStop, getSectionStops, nearestStop, shouldCaptureHeading } from "./sectionPaging.ts";

test("only calibrated chapter starts and the reachable footer are stopping points", () => {
  const stops = getSectionStops([
    { top: 78, height: 822 },
    { top: 900, height: 1644 },
    { top: 2544, height: 822 },
  ], 900, 78, 3486);
  assert.deepEqual(stops, [0, 822, 2466, 2586]);
  assert.equal(adjacentStop(stops, 1644, 1), 2466);
  assert.equal(adjacentStop(stops, 1644, -1), 822);
});

test("an expanded chapter retains continuous reading, without internal forced stops", () => {
  const stops = getSectionStops([{ top: 78, height: 2200 }], 900, 78, 2600);
  assert.deepEqual(stops, [0, 1700]);
  assert.equal(nearestStop(stops, 849), 0);
  assert.equal(nearestStop(stops, 851), 1700);
});

test("section-specific margins align headings with native hash navigation", () => {
  const stops = getSectionStops([
    { top: 0, height: 800, scrollMarginTop: 0 },
    { top: 800, height: 1100, scrollMarginTop: 48 },
    { top: 1900, height: 1500, scrollMarginTop: -12 },
  ], 800, 78, 3520);
  assert.deepEqual(stops, [0, 752, 1912, 2720]);
});

test("all stops clamp to document edges and duplicates disappear", () => {
  assert.deepEqual(getSectionStops([{ top: 0, height: 822 }], 900, 78, 1000), [0, 100]);
  assert.deepEqual(getSectionStops([{ top: 0, height: 100 }], 900, 78, 100), [0]);
});

test("long chapters read continuously; only a close heading or short chapter captures", () => {
  assert.equal(shouldCaptureHeading(0, 2000, 0, 800, 100), false);
  assert.equal(shouldCaptureHeading(600, 2000, 0, 800, 100), false);
  assert.equal(shouldCaptureHeading(1825, 2000, 2000, 800, 20), true);
  assert.equal(shouldCaptureHeading(0, 748, 0, 800, 20), true);
  assert.equal(shouldCaptureHeading(600, 2000, 0, 800, 1500), true);
});

test("trackpad input accumulates to a threshold once, with no inertia chain jumps", () => {
  let result = accumulateWheel(null, 28, 0, 100);
  assert.equal(result.commit, false);
  result = accumulateWheel(result.gesture, 45, 30, 100);
  assert.equal(result.commit, false);
  result = accumulateWheel(result.gesture, 30, 60, 100);
  assert.equal(result.commit, true);
  for (let time = 90; time < 900; time += 70) {
    result = accumulateWheel(result.gesture, 40, time, 100, time < 650);
    assert.equal(result.commit, false);
  }
  result = accumulateWheel(result.gesture, 120, 1200, 100);
  assert.equal(result.commit, true);
});

test("tiny reversed tail noise is ignored, but an intentional reversal unlocks", () => {
  const committed = accumulateWheel(null, 120, 0, 100).gesture;
  const noise = accumulateWheel(committed, -3, 40, 100, true);
  assert.equal(noise.fresh, false);
  assert.equal(noise.gesture.direction, 1);
  const reversed = accumulateWheel(noise.gesture, -45, 80, 100, true);
  assert.equal(reversed.fresh, true);
  assert.equal(reversed.gesture.direction, -1);
  assert.equal(reversed.commit, false);
});
