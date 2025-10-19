require('dotenv').config();

const { DndMoods } = require('../../constants');

const TENOR_API_KEY = process.env.TENOR_API_KEY;
const TENOR_CLIENT_KEY = 'the-rusty-nail-bot';
const DEFAULT_LIMIT = 20;

function selectGifUrl(result) {
    if (!result || !result.media_formats) {
        return null;
    }

    const { gif, mediumgif, tinygif, nanogif, mp4 } = result.media_formats;
    return gif?.url ?? mediumgif?.url ?? tinygif?.url ?? nanogif?.url ?? mp4?.url ?? null;
}

async function fetchRandomGif(query) {
    if (!TENOR_API_KEY) {
        throw new Error('TENOR_API_KEY is not configured.');
    }

    const params = new URLSearchParams({
        q: query,
        key: TENOR_API_KEY,
        client_key: TENOR_CLIENT_KEY,
        limit: String(DEFAULT_LIMIT),
        random: 'true'
    });

    const response = await fetch(`https://tenor.googleapis.com/v2/search?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Tenor API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const results = Array.isArray(payload.results) ? payload.results : [];

    if (results.length === 0) {
        return null;
    }

    const choice = results[Math.floor(Math.random() * results.length)];
    return selectGifUrl(choice);
}

async function sendReactMood(interaction, providedMoodKey) {
    const moodKey = providedMoodKey ?? interaction.options.getString('mood', true);
    const query = DndMoods[moodKey];

    if (!query) {
        await interaction.reply({
            content: `No GIF mood configured for '${moodKey}'.`,
            ephemeral: true
        }).catch(() => {});
        return;
    }

    try {
        const gifUrl = await fetchRandomGif(query);

        if (!gifUrl) {
            await interaction.reply({
                content: `I couldn't find a ${moodKey} GIF right now. Try again later!`,
                ephemeral: true
            }).catch(() => {});
            return;
        }

        await interaction.reply({ content: gifUrl });
        console.log(`Sent '${moodKey}' reaction GIF: ${gifUrl}`);
    } catch (error) {
        console.error(`Failed to fetch GIF for mood '${moodKey}':`, error);

        const failureMessage = 'The tavern\'s GIF stash is empty. Try again later!';
        await interaction.reply({ content: failureMessage, ephemeral: true }).catch(() => {});
    }
}

module.exports = {
    sendReactMood
};
