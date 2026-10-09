import assert from "node:assert/strict";
import test from "node:test";
import { chapterInset } from "./chapterGeometry.ts";

test("chapter openings with different padding align their label at 96px", () => {
  for (const [sectionTop, stripTop] of [[720, 758], [1320, 1442], [2060, 2185.375]]) {
    const inset = chapterInset(sectionTop, stripTop);
    const destination = sectionTop - inset;
    assert.equal(stripTop - destination, 96);
  }
});

test("alignment is independent of the current viewport scroll offset", () => {
  assert.equal(chapterInset(720, 758), chapterInset(-340, -302));
});

test("the home chapter retains document start rather than a synthetic header gap", () => {
  assert.equal(chapterInset(0, 142, true), 0);
});
