const request = require('node-superfetch');
const { createCanvas, loadImage } = require('canvas');
const { stripIndents } = require('common-tags');
const { base64 } = require('../../util/util');
const srod = require("something-random-on-discord").ServerAssistant;

exports.run = async (client, message, args) => {
    let image;
    let attachments = message.attachments.array();
    if (args[0]) {
        if (srod.isURL(args[0])) {
            image = args[0];
        } else {
            return message.inlineReply("that isn't a correct URL!");
        }
    } else {
        if (attachments.length === 0) return message.inlineReply("can you upload any screenshot for me to analyze along with that command?");
        else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!");
        else image = attachments[0].url;
    };
    try {
        
        const status = await fetchRateLimit();
        if (!status.status) {
            return message.inlineReply(`oh no, i'm out of requests! please wait ${status.refresh} seconds and try again.`);
        }
        message.channel.startTyping(true);
        let { body } = await request.get(image);
        if (image.endsWith('.gif')) body = await convertGIF(body);
        const result = await search(body, message.channel.nsfw);
        if (result === 'size') return message.inlineReply('the file is way too big for me to handle lmao. remember not to upload any image or gif larger than 10mb.');
        if (result.nsfw && !message.channel.nsfw) {
            return message.inlineReply('this is from a ||hentai||, and this isn\'t an NSFW channel lmao.');
        }
        const title = `${result.title}${result.episode ? ` episode ${result.episode}` : ''}`;
        await message.channel.stopTyping(true);
        return message.channel.send(stripIndents`
            i'm pretty ${result.prob}% sure this is from **${title}**
            
            ${result.prob < 87 ? '_this probablity is rather low, try using a higher quality image._' : ''}
        `, result.preview ? { files: [{ attachment: result.preview, name: 'preview.mp4' }] } : {});
    } catch (err) {
        await message.channel.stopTyping(true);
        return message.inlineReply(`sorry :( i got no result for that image. the server might be down or you are uploading an invalid file.`)
    }
}

async function convertGIF(image)  {
    const data = await loadImage(image);
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(data, 0, 0);
    return canvas.toBuffer();
}

async function fetchPreview(data) {
    try {
        const { body } = await request
            .get(`https://media.trace.moe/video/${data.anilist_id}/${encodeURIComponent(data.filename)}`)
            .query({
                t: data.at,
                token: data.tokenthumb
            });
        return body;
    } catch {
        return null;
    }
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
        title: data.title_english,
        preview: await fetchPreview(data),
        nsfw: data.is_adult
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
    userPerms: [],
	clientPerms: ["SEND_MESSAGES", "ATTACH_FILES"]
}
