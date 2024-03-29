const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const cheerio = require('cheerio');
const { stripIndents } = require('common-tags');
const { cleanAnilistHTML, embedURL } = require('../../util/util');

const searchGraphQL = stripIndents `
	query ($search: String, $type: MediaType, $isAdult: Boolean) {
		anime: Page (perPage: 10) {
			results: media (type: $type, isAdult: $isAdult, search: $search) {
				id
				title {
					english
					romaji
				}
			}
		}
	}
`;
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

exports.run = async(client, message, args, prefix) => {
        let query = args.join(" ");
        if (!query) return message.reply(`can you give me an anime name? :(\n*tips, if you don\'t know the anime\'s name, you can always use* \`${prefix}what-anime\` *with a screenshot to get the anime's name!*`)
        try {
            message.channel.sendTyping();
            const id = await search(query);
            if (!id) return message.channel.send(`i could not find any results with **${query}** :(\n*tips, if you don\'t know the anime\'s name, you can always use* \`${prefix}what-anime\` *with a screenshot to get the anime's name!*`);
            const anime = await fetchAnime(id);
            const malScore = await fetchMALScore(anime.idMal);
            const malURL = `https://myanimelist.net/anime/${anime.idMal}`;
            const embed = new MessageEmbed()
                .setColor(message.member.displayHexColor)
                .setThumbnail(`${anime.coverImage.large || anime.coverImage.medium || null}`)
                .setTitle(`${anime.title.english || anime.title.romaji}`)
                .setDescription(`${anime.description ? cleanAnilistHTML(anime.description) : '*No description found???*'}`)
                .addField('📜 Status', `${statuses[anime.status]}`, true)
                .addField('📺 Episodes', `${anime.episodes || '???'}`, true)
                .addField('🍁 Season', `${anime.season ? `${seasons[anime.season]} ${anime.startDate.year}` : '???'}`, true)
            .addField('💯 Average score', `${anime.averageScore ? `${anime.averageScore}%` : '???'}`, true)
            .addField(`🧪 MAL score`, `${malScore ? embedURL(malScore, malURL) : '???'}`, true)
            .addField('ℹ️ Links', `${anime.externalLinks.length ?
                anime.externalLinks.map(link => `[${link.site}](${link.url})`).join(', ') :
                'None'}`);;
        return message.channel.send({ embeds: [embed] });
    } catch (err) {
        console.error(err)
        return message.reply(`sorry! i got an error so try again later! the server might be down tho.`)
    }
}
async function search(query) {
    const { body } = await request
        .post('https://graphql.anilist.co/')
        .send({
            variables: {
                search: query,
                type: 'ANIME'
            },
            query: searchGraphQL
        });
    if (!body.data.anime.results.length) return null;
    return body.data.anime.results[0].id;
}
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

exports.help = {
    name: "anime",
    description: "search for an official release anime.\n*tips: you can use my other command* `what-anime` *to find an anime using screenshot!*",
    usage: ["anime `<name>`"],
    example: ["anime `One Piece`"]
};

exports.conf = {
    aliases: ["ani", "anilist"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};