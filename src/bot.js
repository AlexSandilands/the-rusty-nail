require('dotenv').config();

const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { captureGoogleSheet } = require('./screenshotHelper');

const token = process.env.DISCORD_TOKEN;
const sheetsUrl = process.env.GOOGLE_SHEETS_URL;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    client.user.setActivity('/calendar', { type: 'LISTENING' });
});

client.on('messageCreate', message => {
   
    if (!message.author.bot && message.content.startsWith('/calendar')) {
        
        const arguments = message.content.split(" ");

        if (arguments.length < 2) {
            return message.channel.send('Please specify a command: link or pic');
        }
        
        const command = arguments[1];
        switch (command) {
            case "link":
                sendCalendarLink(message);
                break;
            case "pic":
                sendCalendarPic(message);
                break;
            default:
                message.channel.send('Invalid command. Use /calendar link or /calendar pic.');
        }
    }
});

function sendCalendarLink(message) {

    message.channel.send(sheetsUrl)
            .then(() => console.log('Link sent successfully!'))
            .catch(err => console.error('Error sending message:', err));
}

async function sendCalendarPic(message) {
    message.channel.send("Taking screenshot...");

    try {

        const screenshotBuffer = await captureGoogleSheet(sheetsUrl, true);
        const attachment = new AttachmentBuilder(screenshotBuffer, { name: 'screenshot.png' });
        message.channel.send({ files: [attachment] });

    } catch (error) {
        
        console.error('Failed to capture screenshot:', error);
        message.channel.send('Failed to capture the screenshot. Please check the logs.');
    }
}

client.login(token);