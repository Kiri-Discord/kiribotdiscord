const request = require('node-superfetch');
const { createCanvas, loadImage } = require('canvas');
const { stripIndents } = require('common-tags');
const { base64 } = require('../../util/Util');
exports.run = async (client, message, args) => {

    let attachments = message.attachments.array();
    if (attachments.length === 0) return message.reply("please upload some images!");
    else if (attachments.length > 1) return message.reply("i only can process one image at one time!");
    try {
        
        const status = await fetchRateLimit();
        if (!status.status) {
            return message.reply(`oh no, i'm out of requests! please wait ${status.refresh} seconds and try again.`);
        }
        message.channel.startTyping(true);
        let { body } = await request.get(attachments[0].url);
        if (attachments[0].url.endsWith('.gif')) body = await convertGIF(body);
        const result = await search(body, message.channel.nsfw);
        if (result === 'size') return message.reply('the file is way too big for me to handle lmao. remember not to upload any image or gif larger than 10mb.');
        if (result.nsfw && !msg.channel.nsfw) {
            return message.reply('this is from a hentai, and this isn\'t an NSFW channel lmao.');
        }
        const title = `${result.title}${result.episode ? ` episode ${result.episode}` : ''}`;
        await message.channel.stopTyping(true);
        return message.channel.send(stripIndents`
            i'm ${result.prob}% sure this is from ${title}.
            ${result.prob < 87 ? '_this probablity is rather low, try using a higher quality image._' : ''}
        `, result.preview ? { files: [{ attachment: result.preview, name: 'preview.mp4' }] } : {});
    } catch (err) {
        return message.reply(`sorry :( i got an error. try again later! the server might be down tho.`);
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
        return { status: body.quota > 0, refresh: body.quota_ttl };
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
    description: "detect the anime by just a screenshot",
    usage: "what-anime <screenshot>",
    example: "what-anime <random image>"
}

exports.conf = {
    aliases: [],
    cooldown: 10
}
