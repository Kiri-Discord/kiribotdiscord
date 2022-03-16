const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const path = require('path');

exports.run = async(client, message, args) => {
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
        const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'beautiful.png'));
        const { body } = await request.get(image);
        const avatar = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, base.width, base.height);
        ctx.drawImage(avatar, 249, 24, 105, 105);
        ctx.drawImage(avatar, 249, 223, 105, 105);
        ctx.drawImage(base, 0, 0);
        const attachment = canvas.toBuffer();
        return message.channel.send({ files: [{ attachment, name: "beautiful.png" }] });
    } catch (error) {
        return message.channel.send(`sorry, i caught an error :pensive: you can try again later!`)
    };
};

exports.help = {
    name: "beautiful",
    description: "generate a beautiful meme",
    usage: ["beautiful `[URL]`", "beautiful `[image attachment]`"],
    example: ["brazzers `image attachment`", "brazzers `https://example.com/example.jpg`", "brazzers"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};