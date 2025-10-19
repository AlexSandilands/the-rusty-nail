const { DndRules } = require('../../constants');

async function sendRulesPhb(interaction) {
    const url = DndRules.PHB;

    if (!url) {
        await interaction.reply({
            content: 'The Player\'s Handbook URL is not configured.',
            ephemeral: true
        }).catch(() => {});
        return;
    }

    await interaction.reply({ content: url });
    console.log('Sent PHB rules link.');
}

async function sendRulesClass(interaction) {
    const classKey = interaction.options.getString('class', true);
    const url = DndRules[classKey];

    if (!url) {
        await interaction.reply({
            content: `No rules link configured for ${classKey}.`,
            ephemeral: true
        }).catch(() => {});
        return;
    }

    await interaction.reply({ content: url });
    console.log(`Sent ${classKey} rules link.`);
}

module.exports = {
    sendRulesPhb,
    sendRulesClass
};
