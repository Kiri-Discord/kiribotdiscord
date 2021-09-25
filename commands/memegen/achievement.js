const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment } = require('discord.js');
const path = require('path');
const { shortenText } = require('../../util/canvas');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Minecraftia.ttf'), { family: 'Minecraftia' });

exports.run = async(client, message, args) => {
    const text = args.join(" ");
    if (!text) return message.reply(`what achievement do you want to get?`);
    message.channel.sendTyping();
    const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'achievement.png'));
    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(base, 0, 0);
    ctx.font = '17px Minecraftia';
    ctx.fillStyle = '#ffff00';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(shortenText(ctx, text, 230), 60, 60);
    return message.channel.send({
        content: `**${message.author.username}** just got an achievement! ${client.customEmojis.get('party') ? client.customEmojis.get('party') : ':partying_face:'}`,
        files: [new MessageAttachment(canvas.toBuffer(), 'achievement.png')]
    });
};

exports.help = {
    name: "achievement",
    description: "generate a Minecraft achievement notification :stuck_out_tongue:",
    usage: ["achievement `<text>`"],
    example: ["achievement ` being autist`"]
};

exports.conf = {
    aliases: ["mc-achieve", "achieve"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
};