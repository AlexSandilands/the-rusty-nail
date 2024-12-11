// Load environment variables from .env file only in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { Client, GatewayIntentBits } = require('discord.js');
const { sendCalendarLink, sendCalendarPic } = require('./commands.js');
const ScreenshotSize = require('./constants');

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('Error: DISCORD_TOKEN is not defined.');
    process.exit(1);
}

const COMMAND_PREFIX = '/calendar';
const USAGE_MESSAGE = 'Please specify a command: link or pic';
const INVALID_COMMAND_MESSAGE = 'Invalid command. Use /calendar link or /calendar pic.';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Bot is operating in ${client.guilds.cache.size} server(s).`);

    client.user.setActivity('/calendar', { type: 'LISTENING' });
});

client.on('messageCreate', async message => {
    
    if (!message.author.bot && message.content.toLowerCase().startsWith(COMMAND_PREFIX)) {
        
        const args = message.content.slice(COMMAND_PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!command) {
            return message.channel.send(USAGE_MESSAGE);
        }

        try {
            switch (command) {
            case 'link':
                await sendCalendarLink(message);
                break;
            case 'pic':
                await sendCalendarPic(message, ScreenshotSize.SMALL);
                break;
            case 'pic-large':
                await sendCalendarPic(message, ScreenshotSize.LARGE);
                break;
            default:
                message.channel.send(INVALID_COMMAND_MESSAGE);
            }
        } catch (error) {
            console.error(`Error executing command '${command}':`, error);
            message.channel.send('You stabbed yourself with the Nail! (Tell Riv something is broken).');
        }
    }
});

client.login(token)
    .then(() => console.log('Bot logged in successfully'))
    .catch(err => console.error('Failed to log in:', err));