const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const { wrapText } = require('../../../util/canvas');
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Impact.ttf'), { family: 'Impact' });

exports.run = async(client, interaction) => {
    const top = interaction.options.getString('top-text');
    const bottom = interaction.options.getString('bottom-text');

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
        const { body } = await request.get(image);
        const base = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        const fontSize = Math.round(base.height / 10);
        ctx.font = `${fontSize}px Impact`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const topLines = await wrapText(ctx, top, base.width - 10);
        if (!topLines) return interaction.editReply('uh oh. i can\'t make that meme because there wasn\'t enough width to make a meme with that image :pensive:');
        for (let i = 0; i < topLines.length; i++) {
            const textHeight = (i * fontSize) + (i * 10);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 5;
            ctx.strokeText(topLines[i], base.width / 2, textHeight);
            ctx.fillStyle = 'white';
            ctx.fillText(topLines[i], base.width / 2, textHeight);
        }
        const bottomLines = await wrapText(ctx, bottom, base.width - 10);
        if (!bottomLines) return interaction.editReply('uh oh. i can\'t make that meme because there wasn\'t enough width to make a meme with that image :pensive:');
        ctx.textBaseline = 'bottom';
        const initial = base.height - ((bottomLines.length - 1) * fontSize) - ((bottomLines.length - 1) * 10);
        for (let i = 0; i < bottomLines.length; i++) {
            const textHeight = initial + (i * fontSize) + (i * 10);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 5;
            ctx.strokeText(bottomLines[i], base.width / 2, textHeight);
            ctx.fillStyle = 'white';
            ctx.fillText(bottomLines[i], base.width / 2, textHeight);
        }
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return interaction.editReply("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return interaction.editReply({ files: [{ attachment, name: "classic.png" }] });
    } catch (error) {
        return interaction.editReply(`sorry i got an error :pensive: try again later!`)
    };
};