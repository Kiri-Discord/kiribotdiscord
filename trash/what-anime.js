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
            return message.reply(`Oh no, I'm out of requests! Please wait ${status.refresh} seconds and try again.`);
        }
        let { body } = await request.get(attachments[0].url);
        if (attachments.endsWith('.gif')) body = await convertGIF(body);
        const result = await search(body, message.channel.nsfw);
        if (result === 'size') return message.reply('Please do not send an image larger than 10MB.');
        if (result.nsfw && !msg.channel.nsfw) {
            return message.reply('This is from a hentai, and this isn\'t an NSFW channel, pervert.');
        }
        const title = `${result.title}${result.episode ? ` episode ${result.episode}` : ''}`;
        return message.reply(stripIndents`
            I'm ${result.prob}% sure this is from ${title}.
            ${result.prob < 87 ? '_This probablity is rather low, try using a higher quality image._' : ''}
        `, result.preview ? { files: [{ attachment: result.preview, name: 'preview.mp4' }] } : {});
    } catch (err) {
        return message.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
    }
}

function search(file) {
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
    cooldown: 5
}
