
export function groupByDay(items, valueFn) {
  const map = {};

  items.forEach(item => {
    if (!item.createdAt?.toDate) return;

    const day = item.createdAt
      .toDate()
      .toISOString()
      .slice(0, 10);

    map[day] = (map[day] || 0) + valueFn(item);
  });

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}