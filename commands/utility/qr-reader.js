const request = require('node-superfetch');
const { shorten } = require('../../util/util');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const { MessageActionRow, MessageButton } = require('discord.js');

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
                return message.reply({ content: 'i found no recent photo in this channel :pensive:' });
            }
        } else if (attachments.length > 1) return message.reply("i only can process one image at one time!");
        else image = attachments[0].url;
    };
    if (!fileTypeRe.test(image)) return message.reply("uh i think that thing you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:");
    try {
        const { body } = await request
            .get('https://api.qrserver.com/v1/read-qr-code/')
            .query({ fileurl: image });
        const data = body[0].symbol[0];
        if (!data.data) return message.reply(`i couldn't get a link from this QR code. are you sure that this is the right image?`);
        if (validUrl.isWebUri(data.data)) {
            const row = new MessageActionRow()
                .addComponents(new MessageButton()
                    .setStyle('LINK')
                    .setURL(data.data)
                    .setLabel('Avatar URL'))
            return message.channel.send({ content: `here is your link:`, components: [row] });
        } else {
            return message.channel.send({ content: `here is your decoded text:\n||${shorten(data.data), 1800}||` });
        }
    } catch (err) {
        return message.channel.send(`sorry :pensive: i got an error. try again later! can you check the image files?`);
    };
};
exports.help = {
    name: "qr-reader",
    description: "get the link from a QR code!",
    usage: ["qr-reader `<image>`"],
    example: ["qr-reader `<image>`"]
};

exports.conf = {
    aliases: ["qr-read", "readqr"],
    cooldown: 5,
    guildOnly: true,
}