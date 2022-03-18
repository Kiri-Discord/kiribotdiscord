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
        const { body } = await request.get(image);
        const base = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        const fontSize = Math.round(base.height / 15);
        ctx.font = `${fontSize}px Noto`;
        ctx.fillStyle = 'yellow';
        ctx.textAlign = 'center';
        const lines = await wrapText(ctx, text, base.width - 10);
        if (!lines) return interaction.editReply("your subtitle won't fit that meme :grimacing:");
        ctx.textBaseline = 'bottom';
        const initial = base.height - ((lines.length - 1) * fontSize) - (fontSize / 2) - ((lines.length - 1) * 10);
        for (let i = 0; i < lines.length; i++) {
            const textHeight = initial + (i * fontSize) + (i * 10);
            ctx.strokeStyle = 'black';
            const rounded = Math.round(base.height / 100);
            ctx.lineWidth = rounded < 1 ? 1 : rounded;
            ctx.strokeText(lines[i], base.width / 2, textHeight);
            ctx.fillStyle = 'yellow';
            ctx.fillText(lines[i], base.width / 2, textHeight);
        }
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return interaction.editReply("the file is over 8MB for me to upload! yknow i don't have nitro");
        };;
        return interaction.editReply({ files: [{ attachment, name: "modern.png" }] });
    } catch (error) {
        return interaction.editReply(`sorry, i caught an error :pensive: you can try again later!`)
    };
};