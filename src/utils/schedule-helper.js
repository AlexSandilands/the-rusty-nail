const { DateTime } = require('luxon');

function normalizeWeekday(weekday) {
    return weekday % 7; // Luxon: Sunday=7, convert to 0; others keep value.
}

function getNextWeekdayAtTime(baseDate, targetDayIndex, targetHour, targetMinute, timeZone) {
    const base = DateTime.fromJSDate(baseDate, { zone: timeZone });
    const baseDayIndex = normalizeWeekday(base.weekday);

    let daysUntilTarget = (targetDayIndex - baseDayIndex + 7) % 7;
    let target = base.plus({ days: daysUntilTarget }).set({
        hour: targetHour,
        minute: targetMinute,
        second: 0,
        millisecond: 0
    });

    if (daysUntilTarget === 0 && base.toMillis() >= target.toMillis()) {
        target = target.plus({ days: 7 });
    }

    return target.toUTC().toJSDate();
}

function getUpcomingWeekdayOccurrences(baseDate, targetDayIndex, targetHour, targetMinute, timeZone, count) {
    const occurrences = [];
    let cursor = baseDate;

    for (let i = 0; i < count; i += 1) {
        const next = getNextWeekdayAtTime(cursor, targetDayIndex, targetHour, targetMinute, timeZone);
        occurrences.push(next);
        cursor = new Date(next.getTime() + 60_000);
    }

    return occurrences;
}

function getNextScheduledDate(baseDate, schedule, timeOverride) {
    const { weekday, timeZone } = schedule;
    const hourLocal = timeOverride?.hourLocal ?? schedule.hourLocal;
    const minuteLocal = timeOverride?.minuteLocal ?? schedule.minuteLocal ?? 0;
    return getNextWeekdayAtTime(baseDate, weekday, hourLocal, minuteLocal, timeZone);
}

function getUpcomingScheduledDates(count, schedule, baseDate = new Date(), timeOverride) {
    const { weekday, timeZone } = schedule;
    const hourLocal = timeOverride?.hourLocal ?? schedule.hourLocal;
    const minuteLocal = timeOverride?.minuteLocal ?? schedule.minuteLocal ?? 0;
    return getUpcomingWeekdayOccurrences(baseDate, weekday, hourLocal, minuteLocal, timeZone, count);
}

function resolveScheduledDate(selectedDateIso, schedule, options = {}) {
    const { baseDate = new Date(), allowPastSelection = false, timeOverride } = options;
    const fallback = getNextScheduledDate(baseDate, schedule, timeOverride);

    if (!selectedDateIso) {
        return fallback;
    }

    const { timeZone } = schedule;
    const hourLocal = timeOverride?.hourLocal ?? schedule.hourLocal;
    const minuteLocal = timeOverride?.minuteLocal ?? schedule.minuteLocal ?? 0;

    const parsed = DateTime.fromISO(selectedDateIso, { zone: timeZone });
    if (!parsed.isValid) {
        console.warn(`Received invalid scheduled date option '${selectedDateIso}', defaulting to next occurrence.`);
        return fallback;
    }

    const scheduled = parsed.set({
        hour: hourLocal,
        minute: minuteLocal,
        second: 0,
        millisecond: 0
    });

    if (!allowPastSelection) {
        const now = DateTime.fromJSDate(baseDate).setZone(timeZone);
        if (scheduled < now) {
            console.warn(`Received past scheduled date option '${selectedDateIso}', defaulting to next occurrence.`);
            return getNextScheduledDate(now.toJSDate(), schedule, timeOverride);
        }
    }

    return scheduled.toUTC().toJSDate();
}

module.exports = {
    getNextWeekdayAtTime,
    getUpcomingWeekdayOccurrences,
    getNextScheduledDate,
    getUpcomingScheduledDates,
    resolveScheduledDate
};
