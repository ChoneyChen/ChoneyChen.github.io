import assert from "node:assert/strict";
import test from "node:test";
import {
  createScenePresenceController, sceneInPrewarmZone,
  SCENE_EXIT_HOLD_MS, SCENE_PREWARM_PX,
} from "./useScenePresence.ts";

function clock() {
  let now = 0, id = 0;
  const jobs = new Map();
  return {
    scheduler: {
      delay(callback, milliseconds) { const handle = ++id; jobs.set(handle, { at: now + milliseconds, callback }); return handle; },
      cancel(handle) { jobs.delete(handle); },
    },
    advance(milliseconds) {
      const end = now + milliseconds;
      while (true) {
        const next = [...jobs].filter(([, job]) => job.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at; jobs.delete(next[0]); next[1].callback();
      }
      now = end;
    },
  };
}

const viewport = { top: 0, left: 0, bottom: 800, right: 1200 };
const scene = (top, bottom = top + 400) => ({ top, bottom, left: 60, right: 1140 });

test("entrance prewarms just outside either edge, and partial visibility never triggers an area-ratio exit", () => {
  assert.equal(sceneInPrewarmZone(scene(959), viewport), true);
  assert.equal(sceneInPrewarmZone(scene(960), viewport), false);
  assert.equal(sceneInPrewarmZone(scene(-559, -159), viewport), true);
  assert.equal(sceneInPrewarmZone(scene(-560, -160), viewport), false);
  assert.equal(sceneInPrewarmZone(scene(-10000, 1), viewport), true);
  assert.equal(sceneInPrewarmZone(scene(799, 20000), viewport), true);
  assert.equal(sceneInPrewarmZone(scene(500, 500), viewport), false);
  assert.equal(SCENE_PREWARM_PX, 160);
});

test("quick reversals cancel pending resets and a genuine departure allows a new entrance", () => {
  const fake = clock(), changes = [];
  const controller = createScenePresenceController({ scheduler: fake.scheduler, onChange: value => changes.push(value) });
  controller.observe(true);
  controller.observe(false);
  fake.advance(SCENE_EXIT_HOLD_MS - 1);
  assert.deepEqual(changes, [true]);
  controller.observe(true);
  fake.advance(500);
  assert.deepEqual(changes, [true]);
  controller.observe(false);
  fake.advance(SCENE_EXIT_HOLD_MS);
  assert.deepEqual(changes, [true, false]);
  controller.observe(true);
  assert.deepEqual(changes, [true, false, true]);
});

test("repeated observer batches cannot postpone a real exit or emit per-frame changes", () => {
  const fake = clock(), changes = [];
  const controller = createScenePresenceController({ scheduler: fake.scheduler, onChange: value => changes.push(value) });
  controller.observe(true);
  for (let index = 0; index < 60; index++) controller.observe(true);
  controller.observe(false);
  fake.advance(80);
  controller.observe(false);
  fake.advance(40);
  assert.deepEqual(changes, [true, false]);
});

test("late observer output cannot reset a scene that has already returned to the band", () => {
  const fake = clock(), changes = [];
  let stillOutside = true;
  const controller = createScenePresenceController({
    scheduler: fake.scheduler, onChange: value => changes.push(value), confirmExit: () => stillOutside,
  });
  controller.observe(true);
  controller.observe(false);
  stillOutside = false;
  fake.advance(120);
  assert.deepEqual(changes, [true]);
});

test("cleanup cancels resets, and once preserves the optional non-repeating contract", () => {
  const fake = clock(), changes = [];
  const once = createScenePresenceController({ once: true, scheduler: fake.scheduler, onChange: value => changes.push(value) });
  once.observe(true); once.observe(false); fake.advance(1000);
  assert.deepEqual(changes, [true]);
  const regular = createScenePresenceController({ scheduler: fake.scheduler, onChange: value => changes.push(value) });
  regular.observe(true); regular.observe(false); regular.dispose(); fake.advance(1000);
  assert.deepEqual(changes, [true, true]);
});
