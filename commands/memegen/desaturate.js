const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const { desaturate } = require('../../util/canvas');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;

exports.run = async (client, message, args) => {
    let image;
    let attachments = message.attachments.array();
    if (args[0]) {
        if (validUrl.isWebUri(args[0])) {
            image = args[0];
        } else {
            return message.inlineReply("that isn't a correct URL!");
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
                image = message.author.displayAvatarURL({size: 4096, dynamic: false, format: 'png'});
            }
        }
        else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!");
        else image = attachments[0].url;
    };
    if (!fileTypeRe.test(image)) return message.inlineReply("uh i think that thing you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:");
    try {
        message.channel.startTyping(true);
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(data, 0, 0);
        desaturate(ctx, 30, 0, 0, data.width, data.height);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {
            await message.channel.stopTyping(true);
            return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
        };
        await message.channel.stopTyping(true);
        return message.channel.send({files: [{attachment, name: "desaturate.png"}] });
    } catch (error) {
        await message.channel.stopTyping(true);
        return message.inlineReply(`sorry i got an error :pensive: try again later!`)
    };
};

exports.help = {
    name: "desaturate",
    description: "desaturate your image",
    usage: ["desaturate `[URL]`", "desaturate `[image attachment]`"],
    example:  ["desaturate `image attachment`", "desaturate `https://example.com/girl.jpg`", "desaturate"]
};

exports.conf = {
    aliases: ['desaturated'],
    cooldown: 5,
    guildOnly: true,
	channelPerms: ["ATTACH_FILES"]
};
