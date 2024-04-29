require('dotenv').config();

const { AttachmentBuilder } = require('discord.js');
const { captureGoogleSheet } = require('./screenshotHelper');

const sheetsUrl = process.env.GOOGLE_SHEETS_URL;

function sendCalendarLink(message) {

    message.channel.send(sheetsUrl)
            .then(() => console.log('Link sent successfully!'))
            .catch(err => console.error('Error sending message:', err));
}

async function sendCalendarPic(message) {
    message.channel.send("Taking screenshot...");

    try {

        const screenshotBuffer = await captureGoogleSheet(sheetsUrl, false);
        const attachment = new AttachmentBuilder(screenshotBuffer, { name: 'screenshot.png' });
        message.channel.send({ files: [attachment] });

    } catch (error) {
        
        console.error('Failed to capture screenshot:', error);
        message.channel.send('Failed to capture the screenshot. Please check the logs.');
    }
}

module.exports = { sendCalendarLink, sendCalendarPic };