const test = require("node:test");
const assert = require("node:assert/strict");
const { formatCourseDistance, formatAveragePace } = require("../site/challenge-format.js");

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
