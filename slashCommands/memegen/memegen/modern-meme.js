const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const { wrapText } = require('../../../util/canvas');
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Noto-Regular.ttf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Noto-CJK.otf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Noto-Emoji.ttf'), { family: 'Noto' });

exports.run = async(client, interaction) => {
    const text = interaction.options.getString('text');

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
        const base = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.font = '40px Noto';
        const lines = await wrapText(ctx, text, base.width - 10);
        const lineBreakLen = text.content.split('\n').length;
        const linesLen = (40 * lines.length) +
            (40 * (lineBreakLen - 1)) +
            (14 * lines.length) +
            (14 * (lineBreakLen - 1)) +
            14;
        canvas.height += linesLen;
        ctx.font = '40px Noto';
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, base.width, linesLen);
        ctx.fillStyle = 'black';
        ctx.fillText(lines.join('\n'), 5, 5);
        ctx.drawImage(base, 0, linesLen);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return interaction.editReply("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return interaction.editReply({ files: [{ attachment, name: "modern.png" }] });
    } catch (error) {
        return interaction.editReply(`sorry i got an error :pensive: try again later!`);
    };
};