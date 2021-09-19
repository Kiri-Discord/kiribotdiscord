const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const { centerImagePart } = require('../../util/canvas');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;

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
        const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'bob-ross.png'));
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, base.width, base.height);
        const { x, y, width, height } = centerImagePart(data, 440, 440, 15, 20);
        ctx.drawImage(data, x, y, width, height);
        ctx.drawImage(base, 0, 0);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return message.channel.send({ files: [{ attachment, name: "ross.png" }] });
    } catch (error) {;
        return message.reply(`sorry i got an error :pensive: try again later!`)
    };
};

exports.help = {
    name: "bob-ross",
    description: "turn your photo or avatar into one of Bob Ross's masterpieces",
    usage: ["bob-ross `[URL]`", "bob-ross `[image attachment]`"],
    example: ["bob-ross `image attachment`", "bob-ross `https://example.com/girl.jpg`", "bob-ross"]
};

exports.conf = {
    aliases: ["bobross", "ross"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};