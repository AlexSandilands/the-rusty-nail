// Load environment variables from .env file only in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { sendCalendarLink, sendCalendarPic } = require('./commands/calendar/calendar-commands.js');
const { sendConfirmRequest, sendConfirmList } = require('./commands/confirm/confirm-commands.js');
const { sendRulesPhb, sendRulesClass } = require('./commands/rules/rules-commands.js');
const { sendReactMood } = require('./commands/react/react-commands.js');
const { ScreenshotSize } = require('./constants');

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('Error: DISCORD_TOKEN is not defined.');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
    console.log(`Bot is operating in ${readyClient.guilds.cache.size} server(s).`);
    
    readyClient.user.setPresence({
        activities: [{ name: '/nail', type: ActivityType.Listening }],
        status: 'online',
    });
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (interaction.commandName !== 'nail') {
        return;
    }

    try {
        const subcommandGroup = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand();

        switch (subcommandGroup ?? '') {
        case '':
            switch (subcommand) {
            default:
                await interaction.reply({
                    content: 'That Nail command is not implemented yet.',
                    ephemeral: true
                }).catch(() => {});
            }
            break;
        case 'confirm':
            switch (subcommand) {
            case 'prompt':
                await sendConfirmRequest(interaction);
                break;
            case 'list':
                await sendConfirmList(interaction);
                break;
            default:
                await interaction.reply({
                    content: 'That confirm command is not implemented yet.',
                    ephemeral: true
                }).catch(() => {});
            }
            break;
        case 'react':
            await sendReactMood(interaction);
            break;
        case 'rules':
            switch (subcommand) {
            case 'phb':
                await sendRulesPhb(interaction);
                break;
            case 'class':
                await sendRulesClass(interaction);
                break;
            default:
                await interaction.reply({
                    content: 'That rules command is not implemented yet.',
                    ephemeral: true
                }).catch(() => {});
            }
            break;
        case 'calendar':
            switch (subcommand) {
            case 'link':
                await sendCalendarLink(interaction);
                break;
            case 'pic': {
                const sizeChoice = interaction.options.getString('size') ?? 'small';
                const screenshotSize = sizeChoice === 'large' ? ScreenshotSize.LARGE : ScreenshotSize.SMALL;
                await sendCalendarPic(interaction, screenshotSize);
                break;
            }
            default:
                await interaction.reply({
                    content: 'That calendar command is not implemented yet.',
                    ephemeral: true
                }).catch(() => {});
            }
            break;
        default:
            await interaction.reply({
                content: 'That Nail command is not implemented yet.',
                ephemeral: true
            }).catch(() => {});
        }
    } catch (error) {
        const subcommand = interaction.options.getSubcommand(false);
        console.error(`Error executing slash command '${subcommand ?? 'unknown'}':`, error);

        if (error && error.handled) {
            return;
        }

        const failureMessage = 'You stabbed yourself with the Nail! (Tell Riv something is broken).';
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ content: failureMessage, ephemeral: true }).catch(() => {});
        } else {
            await interaction.reply({ content: failureMessage, ephemeral: true }).catch(() => {});
        }
    }
});

client.login(token)
    .then(() => console.log('Bot logged in successfully'))
    .catch(err => console.error('Failed to log in:', err));
