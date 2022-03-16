const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const path = require('path');

exports.run = async(client, interaction, args) => {
    const url = interaction.options.getString('url');
    let image;
    if (url) {
        if (validUrl.isWebUri(url)) {
            if (!fileTypeRe.test(url)) return interaction.reply({
                content: "uh i think that URL you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:",
                ephemeral: true
            });
            image = url;
        } else {
            return interaction.reply({ content: "that isn't a correct URL!", ephemeral: true });
        }
    } else {
        try {
            const caches = interaction.channel.messages.cache.filter(msg => msg.attachments.size > 0);
            if (!caches.size) {
                const fetchs = await interaction.channel.messages.fetch({ limit: 10 });
                const fetch = fetchs.filter(msg => msg.attachments.size > 0);
                const target = fetch.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                image = target.first().attachments.first().url;
            } else {
                const cache = caches.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                image = cache.last().attachments.first().url;
            };
        } catch (error) {
            image = interaction.user.displayAvatarURL({ size: 4096, dynamic: false, format: 'png' });
        };
    };
    await interaction.deferReply();
    try {
        const base = await loadImage(path.join(__dirname, '..', '..', '..', 'assets', 'images', 'brazzers.png'));
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(data, 0, 0);
        const ratio = base.width / base.height;
        const width = data.width / 3;
        const height = Math.round(width / ratio);
        ctx.drawImage(base, 0, data.height - height, width, height);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return interaction.editReply("the file is over 8MB for me to upload! yknow i don't have nitro");
        };
        return interaction.editReply({ files: [{ attachment, name: "brazzers.png" }] });
    } catch (error) {
        return interaction.editReply(`sorry, i caught an error :pensive: you can try again later!`)
    };
};

exports.help = {
    name: "brazzers",
    description: "you get the idea :eyes:",
    usage: ["brazzers `[URL]`", "brazzers `[image attachment]`"],
    example: ["brazzers `image attachment`", "brazzers `https://example.com/example.jpg`", "brazzers"]
};

exports.conf = {
    aliases: ['brazzer'],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};