/** One row per student id (or name+photo fallback) — prevents duplicate tiles on the Results page. */
export function dedupeResultsById(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key =
      item?.id != null
        ? String(item.id)
        : `${String(item?.name || '').toLowerCase()}|${String(item?.photo || item?.image_url || '')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function filterHallOfFame(items = []) {
  return dedupeResultsById(
    items.filter((r) => r.section === 'hallOfFame' || r.section == null || r.section === '')
  );
}

export function filterTopAchievers(items = []) {
  return dedupeResultsById(items.filter((r) => r.section === 'topAchievers'));
}
