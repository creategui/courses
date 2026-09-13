const test = require("node:test");
const assert = require("node:assert/strict");
const {
  formatCourseDistance,
  formatAveragePace,
  colorForResultId,
  createCourseTrackController,
} = require("../site/challenge-format.js");

test("formats valid course distance in whole metres", () => {
  assert.equal(formatCourseDistance(4999.6), "5000");
});

test("uses an em dash for unavailable or invalid course distance", () => {
  assert.equal(formatCourseDistance(null), "—");
  assert.equal(formatCourseDistance(0), "—");
  assert.equal(formatCourseDistance(-1), "—");
});

test("calculates pace per 500m from raw time and measured distance", () => {
  assert.equal(formatAveragePace(1320, 5000), "2:12");
  assert.equal(formatAveragePace(603, 2500), "2:01");
});

test("does not calculate pace when time or distance is invalid", () => {
  assert.equal(formatAveragePace(1200, null), "—");
  assert.equal(formatAveragePace(null, 5000), "—");
  assert.equal(formatAveragePace(1200, 0), "—");
});

test("keeps course-track colours stable for a result", () => {
  assert.equal(colorForResultId("result-a"), colorForResultId("result-a"));
  assert.match(colorForResultId("result-a"), /^#[0-9a-f]{6}$/);
});

test("does not add a stale course path after it has been switched off", async () => {
  let resolveTrack;
  const added = [];
  const removed = [];
  const controller = createCourseTrackController({
    fetchTrack: () => new Promise((resolve) => { resolveTrack = resolve; }),
    colorForId: colorForResultId,
    createLayer: (latlng, color) => ({ latlng, color }),
    addLayer: (layer) => added.push(layer),
    removeLayer: (layer) => removed.push(layer),
  });

  const pending = controller.setSelected("r1", true);
  controller.setSelected("r1", false);
  await Promise.resolve();
  resolveTrack({ latlng: [[1, 2], [3, 4]] });

  assert.equal(await pending, false);
  assert.equal(controller.isSelected("r1"), false);
  assert.deepEqual(added, []);
  assert.deepEqual(removed, []);
});

test("removes selected paths when their rows become hidden", async () => {
  const added = [];
  const removed = [];
  const controller = createCourseTrackController({
    fetchTrack: async () => ({ latlng: [[1, 2], [3, 4]] }),
    colorForId: colorForResultId,
    createLayer: (latlng, color) => ({ latlng, color }),
    addLayer: (layer) => added.push(layer),
    removeLayer: (layer) => removed.push(layer),
  });

  await controller.setSelected("r1", true);
  controller.retain(new Set());

  assert.equal(added.length, 1);
  assert.equal(removed.length, 1);
  assert.equal(controller.isSelected("r1"), false);
});
