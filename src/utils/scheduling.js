import { differenceInCalendarDays, parseISO, format, getISODay } from 'date-fns';

export function getPlannedDayForDate(dateStr, planVersion, logs) {
  if (!planVersion || !planVersion.split || !planVersion.days) return null;

  const cycleLength = planVersion.split.order.length;
  if (cycleLength === 0) return null;

  const targetDate = parseISO(dateStr);

  // Monday = Day 1, Tuesday = Day 2, ..., Sunday = Day 7
  // getISODay: Monday=1, Sunday=7
  const index = (getISODay(targetDate) - 1) % cycleLength;

  const dayName = planVersion.split.order[index];
  const dayData = planVersion.days.find(d => d.day === dayName);

  return {
    dayName,
    dayIndex: index,
    focus: planVersion.split.weekly_pattern[index],
    dayData,
  };
}

export function formatDate(dateStr) {
  const d = parseISO(dateStr);
  return format(d, 'EEE, MMM d, yyyy');
}

export function todayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}
