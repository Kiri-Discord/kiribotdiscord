const { createCanvas, loadImage, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');
const request = require('node-superfetch');
const path = require('path');
const frameCount = 52;
const { streamToArray } = require('../../../util/util');
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Noto-Regular.ttf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Noto-CJK.otf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Noto-Emoji.ttf'), { family: 'Noto' });

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('target');
    const user = member.user;

    const choices = [1, 2];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    let random = Math.floor(Math.random() * 10);
    if (user.id === client.user.id) random = 6;
    const avatarURL = random < 5 ? user.displayAvatarURL({ format: 'png', size: 512 }) : interaction.user.displayAvatarURL({ format: 'png', size: 512 });
    await interaction.deferReply();
    try {
        const { body } = await request.get(avatarURL);
        const avatar = await loadImage(body);
        const imposter = choice === 1;
        const text = random < 5 ? `${user.username} was${imposter ? ' ' : ' not '}an imposter.` : `${interaction.user.username} was${imposter ? ' ' : ' not '}an imposter.`;
        const encoder = new GIFEncoder(320, 180);
        const canvas = createCanvas(320, 180);
        const ctx = canvas.getContext('2d');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.font = '18px Noto';
        const stream = encoder.createReadStream();
        encoder.start();
        encoder.setRepeat(0);
        encoder.setDelay(100);
        encoder.setQuality(200);
        for (let i = 0; i < frameCount; i++) {
            const frameID = `frame_${i.toString().padStart(2, '0')}.gif`;
            const frame = await loadImage(path.join(__dirname, '..', '..', '..', 'assets', 'images', 'eject', frameID));
            ctx.drawImage(frame, 0, 0);
            if (i <= 17) {
                const x = ((320 / 15) * i) - 50;
                const y = (frame.height / 2) - 25;
                const rotation = (360 / 15) * i;
                const angle = rotation * (Math.PI / 180);
                const originX = x + 25;
                const originY = y + 25;
                ctx.translate(originX, originY);
                ctx.rotate(-angle);
                ctx.translate(-originX, -originY);
                ctx.drawImage(avatar, x, y, 50, 50);
                ctx.translate(originX, originY);
                ctx.rotate(angle);
                ctx.translate(-originX, -originY);
            }
            if (i > 17) {
                if (i <= 27) {
                    const letters = Math.ceil(((text.length / 10) * (i - 17)) + 1);
                    const toDraw = text.slice(0, letters + 1);
                    ctx.fillText(toDraw, frame.width / 2, frame.height / 2, 300);
                } else {
                    ctx.fillText(text, frame.width / 2, frame.height / 2, 300);
                }
            };
            encoder.addFrame(ctx);
        };
        encoder.finish();
        const buffer = await streamToArray(stream);
        await interaction.editReply({ content: `ejecting...`, files: [{ attachment: Buffer.concat(buffer), name: 'eject.gif' }] });
        if (random >= 5) return setTimeout(() => {
            const smug = client.customEmojis.get('smug') ? client.customEmojis.get('smug') : ':thinking:';
            return interaction.channel.send(`${interaction.user.username}, suprised? ${smug}${!imposter ? '\n||i was the imposter||' : ''}`)
        }, 5000);
    } catch (err) {
        return interaction.editReply(`bruh, an error occurred when i was trying to eject them :pensive: you can try again later!`);
    };
};