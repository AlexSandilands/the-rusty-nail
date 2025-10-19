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

module.exports = {
    getNextWeekdayAtHour,
    getUpcomingWeekdayOccurrences
};
