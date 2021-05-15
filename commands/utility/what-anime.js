const { createCanvas, loadImage } = require('canvas');
const { stripIndents } = require('common-tags');
const { base64 } = require('../../util/util');
const { cleanAnilistHTML, embedURL } = require('../../util/util');
const validUrl = require('valid-url');
const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const cheerio = require('cheerio');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;

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


exports.run = async (client, message, args, prefix, cmd) => {
    let image;
    let attachments = message.attachments.array();
    if (args[0]) {
        if (validUrl.isWebUri(args[0])) {
            image = args[0];
        } else {
            return message.inlineReply("that isn't a correct URL!");
        }
    } else {
        if (attachments.length === 0) return message.inlineReply("can you paste any URL or upload any screenshot for me to analyze along with that command?");
        else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!");
        else image = attachments[0].url;
    };
    if (!fileTypeRe.test(image)) return message.inlineReply("uh i think that thing you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:")
    try {
        const status = await fetchRateLimit();
        if (!status.status) {
            return message.inlineReply(`oh no, i'm out of requests! please wait ${status.refresh} seconds and try again pls :(`);
        }
        message.channel.startTyping(true);
        let { body } = await request.get(image);
        if (image.endsWith('.gif')) body = await convertGIF(body);
        const result = await search(body);
        if (result === 'size') {
            await message.channel.stopTyping(true);
            return message.inlineReply('the file is way too big for me to handle lmao. remember not to upload any image or gif larger than 10mb pls :)')
        };
        if (result.nsfw && !message.channel.nsfw) {
            await message.channel.stopTyping(true);
            return message.inlineReply('this is from a ||hentai||, and this isn\'t an NSFW channel lmao.');
        };
        const anime = await fetchAnime(result.id);
        const malScore = await fetchMALScore(anime.idMal);
        const malURL = `https://myanimelist.net/anime/${anime.idMal}`;
        const embed = new MessageEmbed()
        .setColor(message.member.displayHexColor)
        .setThumbnail(anime.coverImage.large || anime.coverImage.medium || null)
        .setTitle(anime.title.english || anime.title.romaji)
        .setDescription(anime.description ? cleanAnilistHTML(anime.description) : '*No description found???*')
        .addField('📜 Status', statuses[anime.status], true)
        .addField('📺 Episodes', anime.episodes || '*not found???*', true)
        .addField('🍁 Season', anime.season ? `${seasons[anime.season]} ${anime.startDate.year}` : '???', true)
        .addField('💯 Average score', anime.averageScore ? `${anime.averageScore}%` : '???', true)
        .addField(`🧪 MAL score`, malScore ? embedURL(malScore, malURL) : '???', true)
        .addField('ℹ️ Links', anime.externalLinks.length
            ? anime.externalLinks.map(link => `[${link.site}](${link.url})`).join(', ')
            : 'None')
        .setImage(result.preview);
    
        const title = `${result.title}${result.episode ? ` (episode ${result.episode})` : ''}`;
        await message.channel.stopTyping(true);
        return message.channel.send(stripIndents`
            i'm pretty ${result.prob}% sure this is from ${title} 
            ${result.prob < 87 ? '_i think this probablity is kinda low, try using a higher quality image bruh_' : ''}
        `, embed);
    } catch (err) {
        await message.channel.stopTyping(true);
        return message.inlineReply(`sorry :( i got no result for that image. the server might be down or you are uploading an invalid file.`)
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


async function convertGIF(image)  {
    const data = await loadImage(image);
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(data, 0, 0);
    return canvas.toBuffer();
}

async function fetchRateLimit() {
    try {
        const { body } = await request.get('https://trace.moe/api/me');
        return { status: body.user_limit > 0, refresh: body.user_limit_ttl };
    } catch {
        return { status: false, refresh: Infinity };
    }
}


async function search(file) {
    if (Buffer.byteLength(file) > 1e+7) return 'size';
    const { body } = await request
        .post('https://trace.moe/api/search')
        .attach('image', base64(file));
    const data = body.docs[0];
    return {
        prob: Math.round(data.similarity * 100),
        episode: data.episode,
        title: data.title_english || data.title_romaji,
        preview: `https://media.trace.moe/image/${data.anilist_id}/${encodeURIComponent(data.filename)}?t=${data.at}&token=${data.tokenthumb}&size=l`,
        nsfw: data.is_adult,
        id: data.anilist_id
    };
}

exports.help = {
    name: "what-anime",
    description: "detect the anime by just a screenshot or a gif :)",
    usage: ["what-anime `<image attachment>`", "what-anime `<URL>`"],
    example: ["what-anime `image attachment`", "what-anime `https://example.com/girl.jpg`"]
}

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    
	channelPerms: ["ATTACH_FILES"]
}
