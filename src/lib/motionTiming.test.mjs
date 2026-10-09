import assert from "node:assert/strict";
import test from "node:test";
import { spring } from "motion";
import {
  PRESENTATION_SPEED, motionTimingStyle, presentationBlend,
  presentationTime, slowDragRelease, slowMotion, slowSpring,
} from "./motionTiming.ts";

const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should equal ${expected}`);

test("presentation timing stretches choreography to 0.6 speed without changing keyframes or easing", () => {
  const source = {
    duration: .9, delay: .12, repeatDelay: .3, staggerChildren: .06,
    repeat: 2, times: [0, .25, 1], ease: [.22, 1, .36, 1],
    x: { duration: .6, delay: .18 },
    layout: { duration: .36 },
  };
  const scaled = slowMotion(source);
  close(scaled.duration, 1.5);
  close(scaled.delay, .2);
  close(scaled.repeatDelay, .5);
  close(scaled.staggerChildren, .1);
  close(scaled.x.duration, 1);
  close(scaled.x.delay, .3);
  close(scaled.layout.duration, .6);
  assert.equal(scaled.repeat, 2);
  assert.equal(scaled.times, source.times);
  assert.equal(scaled.ease, source.ease);
  assert.equal(source.duration, .9);
  assert.equal(source.x.duration, .6);
});

test("zero-time/reduced motion and direct-control transitions stay instantaneous", () => {
  assert.deepEqual(slowMotion({ duration: 0, delay: 0 }), { duration: 0, delay: 0 });
  assert.deepEqual(slowMotion({ type: false }), { type: false });
  close(presentationTime(300), 500);
  close(motionTimingStyle["--motion-time-scale"] * PRESENTATION_SPEED, 1);
});

test("time-scaled physics preserves the spring curve, including scripted velocity and rest thresholds", () => {
  const original = {
    stiffness: 210, damping: 25, mass: 1,
    velocity: 30, restSpeed: 2, restDelta: .5,
  };
  const scaled = slowSpring(original);
  close(scaled.stiffness, 75.6);
  close(scaled.damping, 15);
  close(scaled.velocity, 18);
  close(scaled.restSpeed, 1.2);
  assert.equal(scaled.restDelta, .5);
  assert.equal(scaled.mass, 1);
  const faster = spring({ ...original, keyframes: [0, 100] });
  const slower = spring({ ...scaled, keyframes: [0, 100] });
  for (const time of [0, 16, 50, 120, 240, 400, 800]) {
    const oldState = faster.next(time);
    const slowState = slower.next(time / PRESENTATION_SPEED);
    close(slowState.value, oldState.value, 1e-8);
    assert.equal(slowState.done, oldState.done);
  }
});

test("spring implicit coefficients scale without replacing the amplitude-aware stop policy", () => {
  const scaled = slowMotion({ type: "spring", stiffness: 140 });
  close(scaled.stiffness, 50.4);
  close(scaled.damping, 6);
  assert.equal(scaled.restSpeed, undefined);
});

test("drag release is slowed independently from pointer tracking", () => {
  close(slowDragRelease.bounceStiffness, 72);
  close(slowDragRelease.bounceDamping, 24);
  close(slowDragRelease.timeConstant, 1250);
  close(slowDragRelease.restSpeed, 6);
  assert.equal(slowDragRelease.restDelta, 1);
  assert.equal(slowDragRelease.velocity, undefined);
});

test("3D exponential presentation motion has the same response at 30, 60 and 120 Hz", () => {
  for (const rate of [30, 60, 120]) {
    let distance = 1;
    for (let frame = 0; frame < rate; frame++) {
      distance *= 1 - presentationBlend(.085, 1 / rate);
    }
    close(distance, .915 ** (60 * PRESENTATION_SPEED));
  }
  assert.equal(presentationBlend(.15, 0), 0);
});
