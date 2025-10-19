require('dotenv').config();

const {
    getNextScheduledDate,
    getUpcomingScheduledDates,
    resolveScheduledDate
} = require('../../utils/schedule-helper');
const { ConfirmSchedule, ConfirmTimes } = require('../../constants');

const PLAYERS_ROLE_ID = process.env.PLAYERS_ROLE_ID;
const DISPLAY_EMOJIS = [':one:', ':two:', ':three:', ':four:'];
const REACTION_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
const scheduleConfig = Object.freeze({
    weekday: ConfirmSchedule.WEEKDAY,
    hourLocal: ConfirmSchedule.HOUR_LOCAL,
    minuteLocal: ConfirmSchedule.MINUTE_LOCAL,
    timeZone: ConfirmSchedule.TIME_ZONE
});
const timeOverrides = new Map(
    ConfirmTimes.map(time => [time.value, { hourLocal: time.hour, minuteLocal: time.minute }])
);

function getTimeOverride(timeValue) {
    if (!timeValue) {
        return null;
    }
    return timeOverrides.get(timeValue) ?? null;
}

function getNextSaturday(baseDate = new Date(), timeOverride) {
    return getNextScheduledDate(baseDate, scheduleConfig, timeOverride);
}

function getUpcomingSaturdays(count = 4, baseDate = new Date(), timeOverride) {
    return getUpcomingScheduledDates(count, scheduleConfig, baseDate, timeOverride);
}

function resolveConfirmDate(selectedDateIso, timeOverride, baseDate = new Date()) {
    return resolveScheduledDate(selectedDateIso, scheduleConfig, {
        baseDate,
        timeOverride
    });
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
    const timeValue = interaction.options.getString('time', false);
    const timeOverride = getTimeOverride(timeValue);
    const scheduledDate = resolveConfirmDate(selectedDateIso, timeOverride);
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
    const timeValue = interaction.options.getString('time', false);
    const timeOverride = getTimeOverride(timeValue);
    const saturdays = getUpcomingSaturdays(4, new Date(), timeOverride);
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
