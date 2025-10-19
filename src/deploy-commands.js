require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');

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

const commands = [
    new SlashCommandBuilder()
        .setName('nail')
        .setDescription('Interact with The Rusty Nail bot.')
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
