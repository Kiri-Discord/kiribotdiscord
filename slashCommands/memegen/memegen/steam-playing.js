const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const { shortenText } = require('../../../util/canvas');
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Noto-Regular.ttf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Noto-CJK.otf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Noto-Emoji.ttf'), { family: 'Noto' });


exports.run = async(client, interaction, args) => {
    const game = interaction.options.getString('game');
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarURL = user.displayAvatarURL({ format: 'png', size: 64 });
    try {
        await interaction.deferReply();
        const base = await loadImage(path.join(__dirname, '..', '..', '..', 'assets', 'images', 'steam-now-playing.png'));
        const { body } = await request.get(avatarURL);
        const avatar = await loadImage(body);
        const canvas = createCanvas(base.width, base.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(base, 0, 0);
        ctx.drawImage(avatar, 26, 26, 41, 42);
        ctx.fillStyle = '#90b93c';
        ctx.font = '14px Noto';
        ctx.fillText(user.username, 80, 34);
        ctx.fillText(shortenText(ctx, game, 200), 80, 70);
        return interaction.editReply({ files: [{ attachment: canvas.toBuffer(), name: 'steam-now-playing.png' }] });
    } catch (err) {
        console.log(err);
        return interaction.editReply(`sorry :( i got an error. try again later!`);
    };
};