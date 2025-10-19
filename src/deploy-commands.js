require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { DateTime } = require('luxon');
const { ConfirmSchedule, ConfirmTimes, DndRules, DndMoods } = require('./constants');
const { getUpcomingWeekdayOccurrences } = require('./utils/schedule-helper');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
    console.error('Error: DISCORD_TOKEN is not defined.');
    process.exit(1);
}

if (!clientId) {
    console.error('Error: CLIENT_ID is not defined.');
    process.exit(1);
}

const confirmDateChoices = (() => {
    try {
        const occurrences = getUpcomingWeekdayOccurrences(
            new Date(),
            ConfirmSchedule.WEEKDAY,
            ConfirmSchedule.HOUR_LOCAL,
            ConfirmSchedule.MINUTE_LOCAL,
            ConfirmSchedule.TIME_ZONE,
            4
        );

        return occurrences.map(date => {
            const zoned = DateTime.fromJSDate(date, { zone: ConfirmSchedule.TIME_ZONE });
            return {
                name: zoned.toFormat('ccc d LLL'),
                value: zoned.toISODate()
            };
        });
    } catch (error) {
        console.warn('Failed to build confirm date choices:', error);
        return [];
    }
})();

const confirmTimeChoices = ConfirmTimes.map(({ value, label }) => ({
    name: label,
    value
}));

const classChoices = Object.entries(DndRules)
    .filter(([key]) => key !== 'PHB')
    .map(([key]) => ({
        name: key,
        value: key
    }));

const reactMoodChoices = Object.keys(DndMoods).map(mood => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    value: mood
}));

const commands = [
    new SlashCommandBuilder()
        .setName('nail')
        .setDescription('Interact with The Rusty Nail bot.')
        .addSubcommandGroup(group =>
            group
                .setName('confirm')
                .setDescription('Confirmation utilities.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('prompt')
                        .setDescription('Send a confirmation prompt for the selected Saturday (defaults to 8 PM NZ).')
                        .addBooleanOption(option =>
                            option
                                .setName('tag')
                                .setDescription('Mention the players role in the confirmation message.'))
                        .addStringOption(option => {
                            option
                                .setName('date')
                                .setDescription('Pick from upcoming Saturdays (defaults to next upcoming).')
                                .setRequired(false);

                            if (confirmDateChoices.length > 0) {
                                option.addChoices(...confirmDateChoices);
                            }

                            return option;
                        })
                        .addStringOption(option => {
                            option
                                .setName('time')
                                .setDescription('Pick a start time (defaults to 8:00 PM).')
                                .setRequired(false);

                            if (confirmTimeChoices.length > 0) {
                                option.addChoices(...confirmTimeChoices);
                            }

                            return option;
                        }))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('list')
                        .setDescription('List the next four Saturdays (defaults to 8 PM NZ).')
                        .addBooleanOption(option =>
                            option
                                .setName('tag')
                                .setDescription('Mention the players role in the message.'))
                        .addStringOption(option => {
                            option
                                .setName('time')
                                .setDescription('Pick a start time (defaults to 8:00 PM).')
                                .setRequired(false);

                            if (confirmTimeChoices.length > 0) {
                                option.addChoices(...confirmTimeChoices);
                            }

                            return option;
                        })))
        .addSubcommandGroup(group =>
            group
                .setName('react')
                .setDescription('Post a mood-based D&D GIF.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('mood')
                        .setDescription('Share a GIF matching a specific mood.')
                        .addStringOption(option => {
                            option
                                .setName('mood')
                                .setDescription('Choose the mood for the GIF.')
                                .setRequired(true);

                            if (reactMoodChoices.length > 0) {
                                option.addChoices(...reactMoodChoices);
                            }

                            return option;
                        })))
        .addSubcommandGroup(group =>
            group
                .setName('rules')
                .setDescription('D&D rules references.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('phb')
                        .setDescription('Show the Player\'s Handbook rules link.'))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('class')
                        .setDescription('Show a class rules link from the Player\'s Handbook.')
                        .addStringOption(option => {
                            option
                                .setName('class')
                                .setDescription('Select a class to view its rules.')
                                .setRequired(true);

                            if (classChoices.length > 0) {
                                option.addChoices(...classChoices);
                            }

                            return option;
                        })))
        .addSubcommandGroup(group =>
            group
                .setName('calendar')
                .setDescription('Calendar utilities.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('link')
                        .setDescription('Get the calendar link.'))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('pic')
                        .setDescription('Capture a screenshot of the calendar.')
                        .addStringOption(option =>
                            option
                                .setName('size')
                                .setDescription('Screenshot height (defaults to small).')
                                .addChoices(
                                    { name: 'Small', value: 'small' },
                                    { name: 'Large', value: 'large' }
                                ))))
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        if (guildId) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
            console.log('Successfully reloaded guild slash commands.');
        } else {
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            console.log('Successfully reloaded global slash commands.');
        }
    } catch (error) {
        console.error('Failed to deploy slash commands:', error);
        process.exitCode = 1;
    }
})();
