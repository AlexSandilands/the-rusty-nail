require('dotenv').config();

const { DndMoods } = require('../../constants');

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const DEFAULT_LIMIT = 20;

function selectGifUrl(result) {
    if (!result || !result.images) {
        return null;
    }

    const { original, downsized, downsized_medium, fixed_height, fixed_width } = result.images;
    return original?.url ?? downsized?.url ?? downsized_medium?.url ?? fixed_height?.url ?? fixed_width?.url ?? null;
}

async function fetchRandomGif(query) {
    if (!GIPHY_API_KEY) {
        throw new Error('GIPHY_API_KEY is not configured.');
    }

    const params = new URLSearchParams({
        q: query,
        api_key: GIPHY_API_KEY,
        limit: String(DEFAULT_LIMIT),
        rating: 'pg-13',
        bundle: 'messaging_non_clips'
    });

    const response = await fetch(`https://api.giphy.com/v1/gifs/search?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Giphy API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const results = Array.isArray(payload.data) ? payload.data : [];

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

    // Acknowledge within Discord's 3s interaction window before the Giphy fetch,
    // otherwise a slow API response expires the token (DiscordAPIError 10062).
    await interaction.deferReply().catch(() => {});

    try {
        const gifUrl = await fetchRandomGif(query);

        if (!gifUrl) {
            await interaction.editReply({
                content: `I couldn't find a ${moodKey} GIF right now. Try again later!`
            }).catch(() => {});
            return;
        }

        await interaction.editReply({ content: gifUrl });
        console.log(`Sent '${moodKey}' reaction GIF: ${gifUrl}`);
    } catch (error) {
        console.error(`Failed to fetch GIF for mood '${moodKey}':`, error);

        const failureMessage = 'The tavern\'s GIF stash is empty. Try again later!';
        await interaction.editReply({ content: failureMessage }).catch(() => {});
    }
}

module.exports = {
    sendReactMood
};
