const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const cheerio = require('cheerio');
const { stripIndents } = require('common-tags');
const { cleanAnilistHTML, embedURL } = require('../../util/util');
const searchGraphQL = stripIndents`
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
const resultGraphQL = stripIndents`
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
			siteUrl
			type
			status
			volumes
			chapters
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
const statuses = {
	FINISHED: 'Finished',
	RELEASING: 'Releasing',
	NOT_YET_RELEASED: 'Unreleased',
	CANCELLED: 'Cancelled'
};

exports.run = async (client, message, args) => {
    let query = args.join(" ");
    if (!query) return message.reply("pls enter something so i can search 👀");
    try {
        const id = await search(query);
        if (!id) return message.reply(`i couldn\'t find any results with **${query}** :(`);
        const manga = await fetchManga(id);
        const malScore = await fetchMALScore(manga.idMal);
        const malURL = `https://myanimelist.net/manga/${manga.idMal}`;
        const embed = new MessageEmbed()
        .setTimestamp()
        .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
        .setColor('RANDOM')
        .setAuthor('AniList', 'https://i.imgur.com/iUIRC7v.png', 'https://anilist.co/')
        .setURL(manga.siteUrl)
        .setThumbnail(manga.coverImage.large || manga.coverImage.medium || null)
        .setTitle(manga.title.english || manga.title.romaji)
        .setDescription(manga.description ? cleanAnilistHTML(manga.description) : 'No description.')
        .addField(':arrow_right: Status', statuses[manga.status], true)
        .addField(':arrow_right: Chapters / Volumes', `${manga.chapters || '???'}/${manga.volumes || '???'}`, true)
        .addField(':arrow_right: Year', manga.startDate.year || '???', true)
        .addField(':arrow_right: Average score', manga.averageScore ? `${manga.averageScore}%` : '???', true)
        .addField(`:arrow_right: MAL score`, malScore ? embedURL(malScore, malURL) : '???', true)
        .addField(':arrow_right: External links', manga.externalLinks.length
            ? manga.externalLinks.map(link => `[${link.site}](${link.url})`).join(', ')
            : 'None');
        return message.channel.send(embed);
    } catch (err) {
        return message.reply(`sorry :( i got an error. try again later! the server might be down tho.`);
    }
}

async function search(query) {
    const { body } = await request
        .post('https://graphql.anilist.co/')
        .send({
            variables: {
                search: query,
                type: 'MANGA'
            },
            query: searchGraphQL
        });
    if (!body.data.anime.results.length) return null;
    return body.data.anime.results[0].id;
}

async function fetchManga(id) {
    const { body } = await request
        .post('https://graphql.anilist.co/')
        .send({
            variables: {
                id,
                type: 'MANGA'
            },
            query: resultGraphQL
        });
    return body.data.Media;
}

async function fetchMALScore(id) {
    try {
        const { text } = await request.get(`https://myanimelist.net/manga/${id}`);
        const $ = cheerio.load(text);
        return $('span[itemprop="ratingValue"]').first().text();
    } catch {
        return null;
    }
}




exports.help = {
	name: "manga",
	description: "search for a manga.\nonly official release will be searched :)",
	usage: "manga <name>",
	example: "manga `one piece`"
};
  
exports.conf = {
	aliases: [],
    cooldown: 4,
    guildOnly: true,
    userPerms: [],
	clientPerms: []
};



