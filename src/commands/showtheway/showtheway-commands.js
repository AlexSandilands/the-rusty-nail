const path = require('path');

const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

const nailImagePath = path.join(__dirname, '..', '..', '..', 'assets', 'RustyNail.png');

const message = [
    'You found me. Good. A nail only ever opened the way — it was never the end of it.',
    '',
    'You know the wall where we have always counted our days. Seven posts across, ' +
        'forty-two down, a rebel pressed their mark — chalk on white, plain to any ' +
        'who care to look, invisible to loyal eyes.',
    '',
    'Lay your hand across the bare stone, and read what waits there.'
].join('\n');

async function sendShowTheWay(interaction) {
    const attachment = new AttachmentBuilder(nailImagePath, { name: 'RustyNail.png' });

    const embed = new EmbedBuilder()
        .setColor(0x8B4513)
        .setTitle('🕯️ The Nail shows the way…')
        .setDescription(message)
        .setThumbnail('attachment://RustyNail.png');

    await interaction.reply({
        embeds: [embed],
        files: [attachment],
        ephemeral: true
    });

    console.log('Sent showtheway response.');
}

module.exports = { sendShowTheWay };
