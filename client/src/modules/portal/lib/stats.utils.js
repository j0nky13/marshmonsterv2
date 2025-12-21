// src/modules/portal/lib/stats.utils.js

export function filterByTime(items, days) {
  if (days === "all") return items;

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return items.filter(item => {
    if (!item.createdAt?.toDate) return false;
    return item.createdAt.toDate().getTime() >= cutoff;
  });
}

export function trend(current, previous) {
  if (previous === 0) return { value: 0, direction: "flat" };

  const delta = ((current - previous) / previous) * 100;

  return {
    value: Math.round(delta),
    direction:
      delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  };
}