const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');

exports.run = async (client, message, args) => {
    let attachments = message.attachments.array();
    if (attachments.length === 0) return message.inlineReply("can you upload image along with that command?").then(m => m.delete({ timeout: 5000 }));
    else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!").then(m => m.delete({ timeout: 5000 }));

    try {
        message.channel.startTyping(true);
        const { body } = await request.get(attachments[0].url)
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(data, 0, 0);
        desaturate(ctx, -20, 0, 0, data.width, data.height);
        contrast(ctx, 0, 0, data.width, data.height);
        const attachment = canvas.toBuffer('image/jpeg', {quality: 0.2});
        await message.channel.stopTyping(true);
        if (Buffer.byteLength(attachment) > 8e+6) return message.channel.send("the file is way too big for me to upload lmao").then(m => m.delete({ timeout: 5000 }));
        return message.channel.send({files: [{attachment, name: "deep-fried.png"}] });
    } catch (error) {
        await message.channel.stopTyping(true);
        return message.inlineReply(`sorry :( i got an error. try again later! can you check the image files?`)
    }

}
function contrast(ctx, x, y, width, height) {
    const data = ctx.getImageData(x, y, width, height);
    const factor = (259 / 100) + 1;
    const intercept = 128 * (1 - factor);
    for (let i = 0; i < data.data.length; i += 4) {
        data.data[i] = (data.data[i] * factor) + intercept;
        data.data[i + 1] = (data.data[i + 1] * factor) + intercept;
        data.data[i + 2] = (data.data[i + 2] * factor) + intercept;
    }
    ctx.putImageData(data, x, y);
    return ctx;
};

function desaturate(ctx, level, x, y, width, height) {
    const data = ctx.getImageData(x, y, width, height);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const dest = ((i * width) + j) * 4;
            const grey = Number.parseInt((0.2125 * data.data[dest]) + (0.7154 * data.data[dest + 1]) + (0.0721 * data.data[dest + 2]), 10);
            data.data[dest] += level * (grey - data.data[dest]);
            data.data[dest + 1] += level * (grey - data.data[dest + 1]);
            data.data[dest + 2] += level * (grey - data.data[dest + 2])
        }
    }
    ctx.putImageData(data, x, y);
    return ctx
};
exports.help = {
    name: "deepfried",
    description: "fry something on Discord!\nno clickbait",
    usage: "deepfried <image attachment>",
    example: "deepfried"
};

exports.conf = {
    aliases: ["deep-fried"],
    cooldown: 6,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["ATTACH_FILES", "SEND_MESSAGES"]
};