const { stripIndents } = require('common-tags');
const { cleanAnilistHTML, embedURL } = require('../../../util/util');
const validUrl = require('valid-url');
const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const cheerio = require('cheerio');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;

const resultGraphQL = stripIndents `
	query media($id: Int, $type: MediaType) {
		Media(id: $id, type: $type) {
			id
			idMal
			title {
				english
				romaji
			}
			coverImage {
				large
				medium
			}
			startDate { year }
			description(asHtml: false)
			season
			type
			siteUrl
			status
			episodes
			isAdult
			meanScore
			averageScore
			externalLinks {
				url
				site
			}
		}
	}
`;
const seasons = {
    WINTER: 'Winter',
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FALL: 'Fall'
};
const statuses = {
    FINISHED: 'Finished',
    RELEASING: 'Releasing',
    NOT_YET_RELEASED: 'Unreleased',
    CANCELLED: 'Cancelled'
};


exports.run = async(client, interaction) => {
        const url = interaction.options.getString('url');
        let image;
        if (url) {
            if (validUrl.isWebUri(url)) {
                if (!fileTypeRe.test(url)) return interaction.reply({
                    content: "uh i think that URL you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:",
                    ephemeral: true
                });
                image = url;
            } else {
                return interaction.reply({ content: "that isn't a correct URL!", ephemeral: true });
            }
        } else {
            try {
                const caches = interaction.channel.messages.cache.filter(msg => msg.attachments.size > 0);
                if (!caches.size) {
                    const fetchs = await interaction.channel.messages.fetch({ limit: 10 });
                    const fetch = fetchs.filter(msg => msg.attachments.size > 0);
                    const target = fetch.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                    image = target.first().attachments.first().url;
                } else {
                    const cache = caches.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                    image = cache.last().attachments.first().url;
                };
            } catch (error) {
                return interaction.reply({ content: 'i found no recent photo in this channel :pensive:', ephemeral: true });
            };
        };
        await interaction.deferReply();
        try {
            const status = await fetchRateLimit();
            if (!status.ok && status.status) {
                return interaction.editReply(`oh no, i'm out of requests to the server for this month! (1000) consider donating in \`/donate\` if you want to help me in increasing my limit :pensive:`);
            } else if (!status.status) {
                return interaction.editReply("the anime fetching server seems down... :pensive:")
            };;
            let { body } = await request.get(image);
            if (Buffer.byteLength(body) > 1e+7) {
                return interaction.editReply('the file is way too big for me to handle lol. remember not to upload any image or gif larger than 10MB please :slight_smile:');
            }
            const result = await search(image);
            const anime = await fetchAnime(result.id);
            const malScore = await fetchMALScore(anime.idMal);
            const malURL = `https://myanimelist.net/anime/${anime.idMal}`;
            const embed = new MessageEmbed()
                .setColor(interaction.member.displayHexColor)
                .setThumbnail(anime.coverImage.large || anime.coverImage.medium || null)
                .setTitle(`${anime.title.english || anime.title.romaji}`)
                .setDescription(`${anime.description ? cleanAnilistHTML(anime.description) : '*No description found???*'}`)
                .addField('📜 Status', `${statuses[anime.status]}`, true)
                .addField('📺 Episodes', `${anime.episodes || '???'}`, true)
                .addField('🍁 Season', `${anime.season ? `${seasons[anime.season]} ${anime.startDate.year}` : '???'}`, true)
                .addField('💯 Average score', `${anime.averageScore ? `${anime.averageScore}%` : '???'}`, true)
                .addField(`🧪 MAL score`, `${malScore ? embedURL(malScore, malURL) : '???'}`, true)
                .addField('ℹ️ Links', `${anime.externalLinks.length ?
                    anime.externalLinks.map(link => `[${link.site}](${link.url})`).join(', ') :
                    'None'}`)
                .setImage(`${result.preview}`);

            const title = `${anime.title.english || anime.title.romaji}${result.episode ? ` (episode ${result.episode})` : ''}`;
        ;
        return interaction.editReply({
            content: stripIndents`
            i'm pretty ${result.prob}% sure this is from ${title} 
            ${result.prob < 87 ? '_i think this probablity is kinda low, try using a higher quality image_' : ''}
        `,
        embeds: [embed]
        });
    } catch (err) {
        console.error(err);
        return interaction.editReply(`sorry :( i got no result for that image. the server might be down or you are uploading an invalid file.`)
    }
};
async function fetchAnime(id) {
    const { body } = await request
        .post('https://graphql.anilist.co/')
        .send({
            variables: {
                id,
                type: 'ANIME'
            },
            query: resultGraphQL
        });
    return body.data.Media;
};

async function fetchMALScore(id) {
    try {
        const { text } = await request.get(`https://myanimelist.net/anime/${id}`);
        const $ = cheerio.load(text);
        return $('span[itemprop="ratingValue"]').first().text();
    } catch {
        return null;
    }
};


async function fetchRateLimit() {
    try {
        const { body } = await request.get('https://api.trace.moe/me');
        if (body.quotaUsed >= 1000) return { status: true, ok: false };
        else return { status: true, ok: true }
    } catch {
        return { status: false, ok: false };
    }
}


async function search(file) {
    const { body } = await request.get(`https://api.trace.moe/search?url=${encodeURIComponent(file)}`);
    const data = body.result[0];
    return {
        prob: Math.round(data.similarity * 100),
        episode: data.episode,
        preview: data.image,
        id: data.anilist
    };
};