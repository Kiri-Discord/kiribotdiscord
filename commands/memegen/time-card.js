const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const { wrapText } = require('../../util/canvas');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Spongeboytt1.ttf'), { family: 'Spongeboytt1' });

exports.run = async(client, message, args) => {
    const deadEmoji = client.customEmojis.get('dead');
    const text = args.join(" ");
    if (!text) return message.reply(`what is the text that you want to fill? ${deadEmoji}`);
    message.channel.sendTyping();
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');
    const num = Math.floor(Math.random() * 23);
    const base = await loadImage(
        path.join(__dirname, '..', '..', 'assets', 'images', 'spongebob-time-card', `${num}.png`)
    );
    ctx.drawImage(base, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '115px Spongeboytt1';
    const lines = await wrapText(ctx, text.toUpperCase(), 1800);
    const topMost = (canvas.height / 2) - (((115 * lines.length) / 2) + ((60 * (lines.length - 1)) / 2));
    for (let i = 0; i < lines.length; i++) {
        const height = topMost + ((115 + 60) * i);
        ctx.fillStyle = '#ecbd3b';
        ctx.fillText(lines[i], (canvas.width / 2) + 6, height + 6);
        ctx.fillStyle = 'black';
        ctx.fillText(lines[i], canvas.width / 2, height);
    }
    return message.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'spongebob-time-card.png' }] });
};


exports.help = {
    name: "time-card",
    description: "create a Spongebob time card for you",
    usage: ["time-card `<text>`"],
    example: ["time-card `test`"]
};

exports.conf = {
    aliases: ["spongebob", "timecard"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};