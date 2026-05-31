import type { ItineraryDay } from "./types";

/** Day numbers are display ordinals; array order is the source of truth. */
export function renumber(days: ItineraryDay[]): ItineraryDay[] {
  return days.map((d, i) => ({ ...d, day: i + 1 }));
}

export function addDay(days: ItineraryDay[]): ItineraryDay[] {
  return renumber([...days, { day: days.length + 1, title: "", detail: "" }]);
}

export function removeDay(days: ItineraryDay[], index: number): ItineraryDay[] {
  return renumber(days.filter((_, i) => i !== index));
}

export function moveDay(days: ItineraryDay[], from: number, to: number): ItineraryDay[] {
  if (from < 0 || from >= days.length || to < 0 || to >= days.length) return days;
  const next = [...days];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return renumber(next);
}

export function editDay(
  days: ItineraryDay[],
  index: number,
  patch: Partial<Omit<ItineraryDay, "day">>,
): ItineraryDay[] {
  return days.map((d, i) => (i === index ? { ...d, ...patch } : d));
}

export function addItem(list: string[], value: string): string[] {
  const v = value.trim();
  if (!v || list.some((x) => x.toLowerCase() === v.toLowerCase())) return list;
  return [...list, v];
}

export function removeItem(list: string[], index: number): string[] {
  return list.filter((_, i) => i !== index);
}
