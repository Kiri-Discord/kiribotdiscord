const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const path = require('path');

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
    await interaction.deferReply();
    try {
        const base = await loadImage(path.join(__dirname, '..', '..', '..', 'assets', 'images', 'beautiful.png'));
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
        return interaction.editReply({ files: [{ attachment, name: "beautiful.png" }] });
    } catch (error) {
        return interaction.editReply(`sorry, i caught an error :pensive: you can try again later!`)
    };
};