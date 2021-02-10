const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
const { shortenText } = require('../../util/canvas');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Regular.ttf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-CJK.otf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Emoji.ttf'), { family: 'Noto' });


exports.run = async (client, message, args) => {
    let query;
    let game;
    if (!message.mentions.users.first()) {
        query = args.join(" ");
    } else {
        query = args.slice(1).join(" ");
    }
    if (!query) {
        game = "Discord";
    } else {
        game = query;
    }
    const user = message.mentions.users.first() || message.author;
    const avatarURL = user.displayAvatarURL({ format: 'png', size: 64 });
    try {
        const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'steam-now-playing.png'));
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
        return message.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'steam-now-playing.png' }] });
    } catch (err) {
        return message.reply(`sorry :( i got an error. try again later!`);
    }
}
exports.help = {
  name: "steam-playing",
  description: `generate a Steam "Now Playing" notification.`,
  usage: "steam-playing \`[user] <game>\`",
  example: "steam-playing \`@Eftw osu\`"
}

exports.conf = {
  aliases: ["steamnp", "steam-now-playing", "np", "now-playing"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["ATTACH_FILES", "SEND_MESSAGES"]
}