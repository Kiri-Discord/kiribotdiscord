const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const path = require('path');
const { centerImagePart } = require('../../../util/canvas');

exports.run = async(client, interaction) => {
    const url = interaction.options.getString('url');
    const user = interaction.options.getUser('avatar');
    let image;
    
    if (user) {
        image = user.displayAvatarURL({ size: 4096, dynamic: false, format: 'png' });
    } else if (url) {
        if (validUrl.isWebUri(url)) {
            if (!fileTypeRe.test(url)) return interaction.reply({
                content: "uh i think that URL you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:",
                ephemeral: true
            });
            image = url;
        } else {
            return interaction.reply({ content: "that is not a valid URL :pensive:", ephemeral: true });
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
        const base = await loadImage(path.join(__dirname, '..', '..', '..', 'assets', 'images', 'i-fear-no-man.png'));
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        const { x, y, width, height } = centerImagePart(data, 169, 169, 167, 330);
        ctx.drawImage(data, x, y, width, height);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return interaction.editReply("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return interaction.editReply({ files: [{ attachment, name: "ifearnoman.png" }] });
    } catch (error) {
        return interaction.editReply(`sorry :( i got an error. you can try again later or recheck the image file.`);
    };
};