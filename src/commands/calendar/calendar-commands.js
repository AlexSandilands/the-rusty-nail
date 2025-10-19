require('dotenv').config();

const { AttachmentBuilder } = require('discord.js');
const { captureGoogleSheet } = require('../../utils/screenshot-helper');
const { ScreenshotSize } = require('../../constants');

const sheetsUrl = process.env.GOOGLE_SHEETS_URL;

function ensureSheetsUrl() {
    if (!sheetsUrl) {
        throw new Error('GOOGLE_SHEETS_URL is not defined.');
    }
}

async function sendCalendarLink(interaction) {
    ensureSheetsUrl();

    await interaction.reply({ content: sheetsUrl });
    console.log('Calendar link sent successfully.');
}

async function sendCalendarPic(interaction, screenshotSize) {
    ensureSheetsUrl();

    const sizeLabel = screenshotSize === ScreenshotSize.LARGE ? 'Large' : 'Small';
    await interaction.deferReply();

    try {
        const screenshotBuffer = await captureGoogleSheet(sheetsUrl, screenshotSize);
        const attachment = new AttachmentBuilder(screenshotBuffer, { name: `calendar-${sizeLabel.toLowerCase()}.png` });

        await interaction.editReply({
            content: `Here is the ${sizeLabel.toLowerCase()} calendar snapshot.`,
            files: [attachment]
        });

        console.log(`${sizeLabel} calendar screenshot sent.`);
    } catch (error) {
        console.error('Failed to capture screenshot:', error);

        const failureMessage = 'Failed to capture the screenshot. Please check the logs.';
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: failureMessage }).catch(async () => {
                await interaction.followUp({ content: failureMessage, ephemeral: true }).catch(() => {});
            });
        } else {
            await interaction.reply({ content: failureMessage, ephemeral: true }).catch(() => {});
        }

        if (error && typeof error === 'object') {
            error.handled = true;
        }

        throw error;
    }
}

module.exports = { sendCalendarLink, sendCalendarPic };
