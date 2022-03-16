const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const pet = require('pet-pet-gif');

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
        const attachment = await pet(image, {
            resolution: 1024
        });
        return message.channel.send({ files: [{ attachment, name: "pet.gif" }] });
    } catch (error) {
        console.log(error)
        return message.channel.send(`sorry, i caught an error :pensive: you can try again later!`)
    };
};


exports.help = {
    name: "pet",
    description: "pet an image that was sent or your avatar!",
    usage: ["pet `[image attachment]`", "pet `[URL]`"],
    example: ["pet `image attachment`", "pet `https://example.com/example.jpg`", "pet"]
};

exports.conf = {
    aliases: ['pet-the', 'petthe'],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};