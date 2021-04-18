const { loadImage, createCanvas } = require("canvas");
const request = require("node-superfetch");
const srod = require("something-random-on-discord").ServerAssistant;

exports.run = async (client, message, args) => {
    let image;
    let attachments = message.attachments.array();
    if (args[0]) {
        if (srod.isURL(args[0])) {
            image = args[0];
        } else {
            return message.inlineReply("that isn't a correct URL!").then(m => m.delete({ timeout: 5000 }));
        }
    } else {
        if (attachments.length === 0) image = message.author.displayAvatarURL({size: 4096, dynamic: true, format: 'png'});
        else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!").then(m => m.delete({ timeout: 5000 }));
        else image = attachments[0].url;
    };
    var level = 50;
    try {
        message.channel.startTyping(true); 
        
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext("2d");
        await ctx.drawImage(data, 0, 0);
        await fishEye(ctx, level, 0, 0, data.width, data.height);
        const attachment = canvas.toBuffer();
        await message.channel.stopTyping(true);
        if (Buffer.byteLength(attachment) > 8e+6) return message.channel.send("the file is way too big for me to upload lmao");
        return message.channel.send({files: [{attachment, name: "fish-eye.png"}] });
    } catch (error) {
        await message.channel.stopTyping(true);
        return message.inlineReply(`sorry :( i got an error. try again later! can you check the image files?`); 
    }
}

exports.help = {
    name: "fisheye",
    description: "turn your image into *fisheyes*?",
    usage: ["fisheye `[image attachment]`", "fisheye `[URL]`"],
    example: ["fisheye `image attachment`", "fisheye `https://example.com/girl.jpg`", "fisheye"]
};

exports.conf = {
    aliases: ["fish-eye"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["ATTACH_FILES", "SEND_MESSAGES"]
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
    }

    ctx.putImageData(frame, x, y);
    return ctx;
}