const { loadImage, createCanvas } = require("canvas");
const request = require("node-superfetch");
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;

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
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext("2d");
        await ctx.drawImage(data, 0, 0);
        await fishEye(ctx, 50, 0, 0, data.width, data.height);
        const attachment = canvas.toBuffer();;
        if (Buffer.byteLength(attachment) > 8e+6) {;
            return interaction.editReply("the file is over 8MB for me to upload! yknow i don't have nitro");
        };
        return interaction.editReply({ files: [{ attachment, name: "fish-eye.png" }] });
    } catch (error) {
        return interaction.editReply(`sorry :( i got an error. you can try again later or recheck the image file.`);
    }
}


async function fishEye(ctx, level, x, y, width, height) {
    const frame = ctx.getImageData(x, y, width, height);
    const source = new Uint8Array(frame.data);

    for (let i = 0; i < frame.data.length; i += 4) {
        const sx = (i / 4) % frame.width;
        const sy = Math.floor(i / 4 / frame.width);

        const dx = Math.floor(frame.width / 2) - sx;
        const dy = Math.floor(frame.height / 2) - sy;

        const dist = Math.sqrt((dx * dx) + (dy * dy));

        const x2 = Math.round((frame.width / 2) - (dx * Math.sin(dist / (level * Math.PI) / 2)));
        const y2 = Math.round((frame.height / 2) - (dy * Math.sin(dist / (level * Math.PI) / 2)));
        const i2 = ((y2 * frame.width) + x2) * 4;

        frame.data[i] = source[i2];
        frame.data[i + 1] = source[i2 + 1];
        frame.data[i + 2] = source[i2 + 2];
        frame.data[i + 3] = source[i2 + 3];
    };
    ctx.putImageData(frame, x, y);
    return ctx;
};