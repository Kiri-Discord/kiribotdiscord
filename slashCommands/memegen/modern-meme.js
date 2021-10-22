const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const { wrapText } = require('../../util/canvas');
const { askString } = require('../../util/util');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Regular.ttf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-CJK.otf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Emoji.ttf'), { family: 'Noto' });

exports.run = async(client, message, args) => {
    const filter = res => res.author.id === message.author.id;
    await message.channel.send('what should the text in your meme be? jot it down below :wink:\ni will be leaving in 20 second. type \`cancel\` to cancel this command');
    const text = await askString(message.channel, filter);
    if (!text) return message.channel.send('i cancelled the command :pensive:');

    let image;
    let attachments = [...message.attachments.values()];
    if (args[0]) {
        if (validUrl.isWebUri(args[0])) {
            image = args[0];
        } else {
            return message.reply("that isn't a correct URL!");
        }
    } else {
        if (attachments.length === 0) {
            try {
                const caches = message.channel.messages.cache.filter(msg => msg.attachments.size > 0);
                if (!caches.size) {
                    const fetchs = await message.channel.messages.fetch({ limit: 10 });
                    const fetch = fetchs.filter(msg => msg.attachments.size > 0);
                    const target = fetch.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                    image = target.first().attachments.first().url;
                } else {
                    const cache = caches.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                    image = cache.last().attachments.first().url;
                };
            } catch (error) {
                image = message.author.displayAvatarURL({ size: 4096, dynamic: false, format: 'png' });
            }
        } else if (attachments.length > 1) return message.reply("i only can process one image at one time!");
        else image = attachments[0].url;
    };
    if (!fileTypeRe.test(image)) return message.reply("uh i think that thing you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:");
    try {
        message.channel.sendTyping();
        const { body } = await request.get(image);
        const base = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.font = '40px Noto';
        const lines = await wrapText(ctx, text.content, base.width - 10);
        const lineBreakLen = text.content.split('\n').length;
        const linesLen = (40 * lines.length) +
            (40 * (lineBreakLen - 1)) +
            (14 * lines.length) +
            (14 * (lineBreakLen - 1)) +
            14;
        canvas.height += linesLen;
        ctx.font = '40px Noto';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, base.width, linesLen);
        ctx.fillStyle = 'black';
        ctx.fillText(lines.join('\n'), 5, 5);
        ctx.drawImage(base, 0, linesLen);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return message.channel.send({ files: [{ attachment, name: "modern.png" }] });
    } catch (error) {;
        return message.reply(`sorry i got an error :pensive: try again later!`)
    };
};

exports.help = {
    name: "modern-meme",
    description: "generate a modern meme with text and photo of your liking",
    usage: ["modern-meme `[URL]`", "modern-meme `[image attachment]`"],
    example: ["modern-meme `image attachment`", "modern-meme `https://example.com/girl.jpg`", "modern-meme"]
};

exports.conf = {
    aliases: ["modernmeme", "modern"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};