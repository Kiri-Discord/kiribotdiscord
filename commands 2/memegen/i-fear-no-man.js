const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const path = require('path');
const { centerImagePart } = require('../../util/canvas');

exports.run = async(client, message, args) => {
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
    try {
        const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'i-fear-no-man.png'));
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        const { x, y, width, height } = centerImagePart(data, 169, 169, 167, 330);
        ctx.drawImage(data, x, y, width, height);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {
            await message.channel.stopTyping(true);
            return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
        };
        await message.channel.stopTyping(true);
        return message.channel.send({ files: [{ attachment, name: "ifearnoman.png" }] });
    } catch (error) {
        await message.channel.stopTyping(true);
        return message.reply(`sorry i got an error :pensive: try again later!`)
    };
};

exports.help = {
    name: "i-fear-no-man",
    description: "i fear no man, but that thing...",
    usage: ["i-fear-no-man `[URL]`", "i-fear-no-man `[image attachment]`"],
    example: ["i-fear-no-man `image attachment`", "i-fear-no-man `https://example.com/girl.jpg`", "i-fear-no-man"]
};

exports.conf = {
    aliases: ['ifearnoman'],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};