const { DateTime } = require('luxon');

function normalizeWeekday(weekday) {
    return weekday % 7; // Luxon: Sunday=7, convert to 0; others keep value.
}

function getNextWeekdayAtHour(baseDate, targetDayIndex, targetHour, timeZone) {
    const base = DateTime.fromJSDate(baseDate, { zone: timeZone });
    const baseDayIndex = normalizeWeekday(base.weekday);

    let daysUntilTarget = (targetDayIndex - baseDayIndex + 7) % 7;
    let target = base.plus({ days: daysUntilTarget }).set({
        hour: targetHour,
        minute: 0,
        second: 0,
        millisecond: 0
    });

    if (daysUntilTarget === 0 && base.toMillis() >= target.toMillis()) {
        target = target.plus({ days: 7 });
    }

    return target.toUTC().toJSDate();
}

function getUpcomingWeekdayOccurrences(baseDate, targetDayIndex, targetHour, timeZone, count) {
    const occurrences = [];
    let cursor = baseDate;

    for (let i = 0; i < count; i += 1) {
        const next = getNextWeekdayAtHour(cursor, targetDayIndex, targetHour, timeZone);
        occurrences.push(next);
        cursor = new Date(next.getTime() + 60_000);
    }

    return occurrences;
}

function getNextScheduledDate(baseDate, schedule) {
    const { weekday, hourLocal, timeZone } = schedule;
    return getNextWeekdayAtHour(baseDate, weekday, hourLocal, timeZone);
}

function getUpcomingScheduledDates(count, schedule, baseDate = new Date()) {
    const { weekday, hourLocal, timeZone } = schedule;
    return getUpcomingWeekdayOccurrences(baseDate, weekday, hourLocal, timeZone, count);
}

function resolveScheduledDate(selectedDateIso, schedule, options = {}) {
    const { weekday, hourLocal, timeZone } = schedule;
    const { baseDate = new Date(), allowPastSelection = false } = options;

    const fallback = getNextScheduledDate(baseDate, schedule);

    if (!selectedDateIso) {
        return fallback;
    }

    const parsed = DateTime.fromISO(selectedDateIso, { zone: timeZone });
    if (!parsed.isValid) {
        console.warn(`Received invalid scheduled date option '${selectedDateIso}', defaulting to next occurrence.`);
        return fallback;
    }

    const scheduled = parsed.set({
        hour: hourLocal,
        minute: 0,
        second: 0,
        millisecond: 0
    });

    if (!allowPastSelection) {
        const now = DateTime.fromJSDate(baseDate).setZone(timeZone);
        if (scheduled < now) {
            console.warn(`Received past scheduled date option '${selectedDateIso}', defaulting to next occurrence.`);
            return getNextScheduledDate(now.toJSDate(), schedule);
        }
    }

    return scheduled.toUTC().toJSDate();
}

module.exports = {
    getNextWeekdayAtHour,
    getUpcomingWeekdayOccurrences,
    getNextScheduledDate,
    getUpcomingScheduledDates,
    resolveScheduledDate
};
