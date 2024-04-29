require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { sendCalendarLink, sendCalendarPic } = require('./commands.js');

const token = process.env.DISCORD_TOKEN;

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

client.login(token);