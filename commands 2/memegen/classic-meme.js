const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const { wrapText } = require('../../util/canvas');
const { askString } = require('../../util/util');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Impact.ttf'), { family: 'Impact' });

exports.run = async(client, message, args) => {
    const filter = res => res.author.id === message.author.id;
    await message.channel.send('what should the top text be? jot it down below :wink:\ni will be leaving in 20 second. type \`cancel\` to cancel this command');
    const top = await askString(message.channel, filter);
    if (!top) return message.channel.send('i cancelled the command :pensive:');
    await message.channel.send('what should the below text be? jot it down below :wink:\ni will be leaving in 20 second. type \`cancel\` to cancel this command');
    const bottom = await askString(message.channel, filter);
    if (!bottom) return message.channel.send('i cancelled the command :pensive:');

    let image;
    let attachments = message.attachments.array();
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
    try {;
        const { body } = await request.get(image);
        const base = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        const fontSize = Math.round(base.height / 10);
        ctx.font = `${fontSize}px Impact`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const topLines = await wrapText(ctx, top.content, base.width - 10);
        if (!topLines) return message.channel.send('uh oh. i can\'t make that meme because there wasn\'t enough width to make a meme with that image :pensive:');
        for (let i = 0; i < topLines.length; i++) {
            const textHeight = (i * fontSize) + (i * 10);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 5;
            ctx.strokeText(topLines[i], base.width / 2, textHeight);
            ctx.fillStyle = 'white';
            ctx.fillText(topLines[i], base.width / 2, textHeight);
        }
        const bottomLines = await wrapText(ctx, bottom.content, base.width - 10);
        if (!bottomLines) return message.channel.send('uh oh. i can\'t make that meme because there wasn\'t enough width to make a meme with that image :pensive:');
        ctx.textBaseline = 'bottom';
        const initial = base.height - ((bottomLines.length - 1) * fontSize) - ((bottomLines.length - 1) * 10);
        for (let i = 0; i < bottomLines.length; i++) {
            const textHeight = initial + (i * fontSize) + (i * 10);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 5;
            ctx.strokeText(bottomLines[i], base.width / 2, textHeight);
            ctx.fillStyle = 'white';
            ctx.fillText(bottomLines[i], base.width / 2, textHeight);
        }
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return message.channel.send({ files: [{ attachment, name: "classic.png" }] });
    } catch (error) {;
        return message.reply(`sorry i got an error :pensive: try again later!`)
    };
};

exports.help = {
    name: "classic-meme",
    description: "generate a classic meme with text and photo of your liking",
    usage: ["classic-meme `[URL]`", "classic-meme `[image attachment]`"],
    example: ["classic-meme `image attachment`", "classic-meme `https://example.com/girl.jpg`", "classic-meme"]
};

exports.conf = {
    aliases: ["classicmeme", "classic"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};