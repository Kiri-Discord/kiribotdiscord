const request = require('node-superfetch');
const { createCanvas, loadImage } = require('canvas');
const { distort } = require('../../util/canvas.js');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;

exports.run = async(client, message, args, prefix) => {
    let distort_level;
    let image;
    let attachments = [...message.attachments.values()];
    if (args[0]) {
        if (validUrl.isWebUri(args[0])) {
            image = args[0];
            distort_level = args[1];
        } else if (client.utils.parseMember(message, args[0])) {
            const member = client.utils.parseMember(message, args[0])
            image = member.user.displayAvatarURL({ size: 4096, dynamic: false, format: 'png' });
            distort_level = args[1];
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
            distort_level = args[0];
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
        distort_level = args[0];
    };
    if (!fileTypeRe.test(image)) return message.reply("uh i think that thing you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:")
    try {
        if (!distort_level) distort_level = 3;
        message.channel.sendTyping();
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(data, 0, 0);
        distort(ctx, distort_level, 0, 0, data.width, data.height);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return message.channel.send({ files: [{ attachment, name: 'greyscale.png' }] });
    } catch (err) {;
        return message.reply(`sorry, i got an error :( you can try again later or recheck the image file.`);
    }
};

exports.help = {
    name: "distort",
    description: "distort an image?",
    usage: ["distort `[image URL] [amount]`", "distort `[@user] [amount]`", "distort `[amount]`"],
    example: ["distort `@Whumpus 2`", "distort `https://example.com/example.jpg 2`", "distort 2"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
}