require('dotenv').config();

const { DateTime } = require('luxon');
const { getNextWeekdayAtHour, getUpcomingWeekdayOccurrences } = require('../../utils/datetime-helper');
const { ConfirmSchedule } = require('../../constants');

const PLAYERS_ROLE_ID = process.env.PLAYERS_ROLE_ID;
const DISPLAY_EMOJIS = [':one:', ':two:', ':three:', ':four:'];
const REACTION_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

function getNextSaturday(baseDate = new Date()) {
    return getNextWeekdayAtHour(
        baseDate,
        ConfirmSchedule.WEEKDAY,
        ConfirmSchedule.HOUR_LOCAL,
        ConfirmSchedule.TIME_ZONE
    );
}

function getUpcomingSaturdays(count = 4, baseDate = new Date()) {
    return getUpcomingWeekdayOccurrences(
        baseDate,
        ConfirmSchedule.WEEKDAY,
        ConfirmSchedule.HOUR_LOCAL,
        ConfirmSchedule.TIME_ZONE,
        count
    );
}

function resolveConfirmDate(selectedDateIso) {
    if (!selectedDateIso) {
        return getNextSaturday();
    }

    const parsed = DateTime.fromISO(selectedDateIso, { zone: ConfirmSchedule.TIME_ZONE });
    if (!parsed.isValid) {
        console.warn(`Received invalid date option '${selectedDateIso}', defaulting to next Saturday.`);
        return getNextSaturday();
    }

    const scheduled = parsed.set({
        hour: ConfirmSchedule.HOUR_LOCAL,
        minute: 0,
        second: 0,
        millisecond: 0
    });

    const now = DateTime.now().setZone(ConfirmSchedule.TIME_ZONE);
    if (scheduled < now) {
        console.warn(`Received past date option '${selectedDateIso}', defaulting to next Saturday.`);
        return getNextSaturday(now.toJSDate());
    }

    return scheduled.toUTC().toJSDate();
}

function formatUpcomingSaturdaysList(dates) {
    return dates.map((date, index) => {
        const emoji = DISPLAY_EMOJIS[index] ?? `:${index + 1}:`;
        const timestamp = Math.floor(date.getTime() / 1000);
        return `${emoji} :: <t:${timestamp}:F>`;
    }).join('\n');
}

async function sendConfirmRequest(interaction) {
    const selectedDateIso = interaction.options.getString('date', false);
    const scheduledDate = resolveConfirmDate(selectedDateIso);
    const timestamp = Math.floor(scheduledDate.getTime() / 1000);
    const shouldTagPlayers = interaction.options.getBoolean('tag') ?? false;

    let content = `React to confirm: <t:${timestamp}:F>`;

    if (shouldTagPlayers) {
        if (PLAYERS_ROLE_ID) {
            content = `<@&${PLAYERS_ROLE_ID}> ${content}`;
        } else {
            console.warn('PLAYERS_ROLE_ID is not defined. Unable to tag players role.');
        }
    }

    await interaction.reply({ content });

    console.log(`Confirm prompt sent for ${scheduledDate.toISOString()} (${timestamp}).`);
}

async function sendConfirmList(interaction) {
    const saturdays = getUpcomingSaturdays();
    const shouldTagPlayers = interaction.options.getBoolean('tag') ?? false;

    if (saturdays.length === 0) {
        await interaction.reply({
            content: 'No upcoming Saturdays could be determined.',
            ephemeral: true
        }).catch(() => {});
        return;
    }

    let content = formatUpcomingSaturdaysList(saturdays);

    if (shouldTagPlayers) {
        if (PLAYERS_ROLE_ID) {
            content = `<@&${PLAYERS_ROLE_ID}>\n${content}`;
        } else {
            console.warn('PLAYERS_ROLE_ID is not defined. Unable to tag players role.');
        }
    }

    await interaction.reply({ content });

    const message = await interaction.fetchReply().catch(error => {
        console.warn('Failed to fetch sent confirm list message:', error);
        return null;
    });

    if (!message) {
        return;
    }

    for (let i = 0; i < REACTION_EMOJIS.length && i < saturdays.length; i += 1) {
        const emoji = REACTION_EMOJIS[i];
        try {
            await message.react(emoji);
        } catch (error) {
            console.warn(`Failed to react with '${emoji}':`, error);
        }
    }

    console.log('Upcoming Saturdays list sent.');
}

module.exports = {
    sendConfirmRequest,
    sendConfirmList,
    getNextSaturday,
    getUpcomingSaturdays
};
