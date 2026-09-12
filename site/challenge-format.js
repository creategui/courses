/* Shared presentation helpers for challenge results. */
(function (root, factory) {
  const api = factory();
  root.rownativeChallengeFormat = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function formatTime(seconds) {
    if (seconds == null) return "—";
    const s = Math.round(Number(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins + ":" + String(secs).padStart(2, "0");
  }

  function formatCourseDistance(distanceM) {
    const distance = Number(distanceM);
    return Number.isFinite(distance) && distance > 0 ? String(Math.round(distance)) : "—";
  }

  function formatAveragePace(rawTimeS, distanceM) {
    const rawTime = Number(rawTimeS);
    const distance = Number(distanceM);
    if (!Number.isFinite(rawTime) || rawTime <= 0 || !Number.isFinite(distance) || distance <= 0) return "—";
    return formatTime(rawTime * 500 / distance);
  }

  return { formatCourseDistance, formatAveragePace };
});
