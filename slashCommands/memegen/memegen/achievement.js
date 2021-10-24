const { createCanvas, loadImage, registerFont } = require('canvas');
const { MessageAttachment } = require('discord.js');
const path = require('path');
const { shortenText } = require('../../../util/canvas');
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Minecraftia.ttf'), { family: 'Minecraftia' });

exports.run = async(client, interaction) => {
    const text = interaction.options.getString('text');
    await interaction.deferReply();
    const base = await loadImage(path.join(__dirname, '..', '..', '..', 'assets', 'images', 'achievement.png'));
    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(base, 0, 0);
    ctx.font = '17px Minecraftia';
    ctx.fillStyle = '#ffff00';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(shortenText(ctx, text, 230), 60, 60);
    return interaction.editReply({
        content: `**${interaction.user.username}** just got an achievement! ${client.customEmojis.get('party') ? client.customEmojis.get('party') : ':partying_face:'}`,
        files: [new MessageAttachment(canvas.toBuffer(), 'achievement.png')]
    });
};