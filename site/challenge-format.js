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
    const totalTenths = Math.round(rawTime * 5000 / distance);
    const mins = Math.floor(totalTenths / 600);
    const secs = ((totalTenths % 600) / 10).toFixed(1);
    return mins + ":" + secs.padStart(4, "0");
  }

  function colorForResultId(resultId) {
    const palette = ["#0b6e99", "#be4b20", "#6a4c93", "#2b8a3e", "#a61e4d", "#7950f2"];
    let hash = 0;
    const value = String(resultId || "");
    for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    return palette[Math.abs(hash) % palette.length];
  }

  function createCourseTrackController(options) {
    const selected = new Set();
    const layers = new Map();
    const generations = new Map();

    function nextGeneration(resultId) {
      const next = (generations.get(resultId) || 0) + 1;
      generations.set(resultId, next);
      return next;
    }

    function deselect(resultId) {
      selected.delete(resultId);
      nextGeneration(resultId);
      const layer = layers.get(resultId);
      if (layer) {
        options.removeLayer(layer);
        layers.delete(resultId);
      }
    }

    function setSelected(resultId, shouldShow) {
      const id = String(resultId);
      if (!shouldShow) {
        deselect(id);
        return Promise.resolve(false);
      }
      if (selected.has(id)) return Promise.resolve(true);

      selected.add(id);
      const generation = nextGeneration(id);
      return Promise.resolve()
        .then(() => options.fetchTrack(id))
        .then((data) => {
          const latlng = data && data.latlng;
          if (!Array.isArray(latlng) || latlng.length < 2) throw new Error("Course path is unavailable");
          if (!selected.has(id) || generations.get(id) !== generation) return false;
          const layer = options.createLayer(latlng, options.colorForId(id));
          layers.set(id, layer);
          options.addLayer(layer);
          return true;
        })
        .catch((error) => {
          if (selected.has(id) && generations.get(id) === generation) {
            deselect(id);
            if (typeof options.onLoadError === "function") options.onLoadError(id, error);
          }
          return false;
        });
    }

    function retain(visibleResultIds) {
      selected.forEach((id) => {
        if (!visibleResultIds.has(id)) deselect(id);
      });
    }

    return {
      setSelected,
      retain,
      isSelected(resultId) { return selected.has(String(resultId)); },
    };
  }

  return { formatCourseDistance, formatAveragePace, colorForResultId, createCourseTrackController };
});
