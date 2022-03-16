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
    await message.channel.send('what should the subtitle be? jot it down below :wink:\ni will be leaving in 10 second. type \`cancel\` to cancel this command');
    const filter = res => res.author.id === message.author.id;
    const text = await askString(message.channel, filter);
    if (!text) return message.channel.send('i cancelled the command :pensive:');

    let image;
    let attachments = [...message.attachments.values()];
    if (args[0]) {
        if (validUrl.isWebUri(args[0])) {
            image = args[0];
        } else {
            return message.reply("that isn't a correct URL!");
        };
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
        ctx.drawImage(base, 0, 0);
        const fontSize = Math.round(base.height / 15);
        ctx.font = `${fontSize}px Noto`;
        ctx.fillStyle = 'yellow';
        ctx.textAlign = 'center';
        const lines = await wrapText(ctx, text.content, base.width - 10);
        if (!lines) return message.channel.send("your subtitle won't fit that meme :grimacing:");
        ctx.textBaseline = 'bottom';
        const initial = base.height - ((lines.length - 1) * fontSize) - (fontSize / 2) - ((lines.length - 1) * 10);
        for (let i = 0; i < lines.length; i++) {
            const textHeight = initial + (i * fontSize) + (i * 10);
            ctx.strokeStyle = 'black';
            const rounded = Math.round(base.height / 100);
            ctx.lineWidth = rounded < 1 ? 1 : rounded;
            ctx.strokeText(lines[i], base.width / 2, textHeight);
            ctx.fillStyle = 'yellow';
            ctx.fillText(lines[i], base.width / 2, textHeight);
        }
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return message.channel.send({ files: [{ attachment, name: "modern.png" }] });
    } catch (error) {;
        return message.channel.send(`sorry, i caught an error :pensive: you can try again later!`)
    };
};

exports.help = {
    name: "subtitle",
    description: "add subtitle to your image",
    usage: ["subtitle `[URL]`", "subtitle `[image attachment]`"],
    example: ["subtitle `image attachment`", "subtitle `https://example.com/example.jpg`", "subtitle"]
};

exports.conf = {
    aliases: ["sub"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};