const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const { contrast } = require('../../../util/canvas');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;

exports.run = async(client, interaction) => {
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
    try {
        await interaction.deferReply();
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(data, 0, 0);
        contrast(ctx, 0, 0, data.width, data.height);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return interaction.editReply("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return interaction.editReply({ files: [{ attachment, name: "contrast.png" }] });
    } catch (error) {
        return interaction.editReply(`sorry i got an error :pensive: try again later!`)
    };
};

exports.help = {
    name: "contrast",
    description: "get more contrast to your image :thinking:",
    usage: ["contrast `[URL]`", "contrast `[image attachment]`"],
    example: ["contrast `image attachment`", "contrast `https://example.com/girl.jpg`", "contrast"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};