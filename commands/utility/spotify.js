const { createCanvas, loadImage, registerFont } = require('canvas');
const request = require('node-superfetch');
const path = require('path');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Regular.ttf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Bold.ttf'), { family: 'Noto', weight: 'bold' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-CJK.otf'), { family: 'Noto' });
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'Noto-Emoji.ttf'), { family: 'Noto' });

exports.run = async (client, message, args) => {
    const member  = await getMemberfromMention(args[0], message.guild) || message.member;
    const { user } = member;

    let status;
    if (user.presence.activities.length === 1) status = user.presence.activities[0];
    else if (user.presence.activities.length > 1) status = user.presence.activities[1];

    if (user.presence.activities.length === 0 || status.name !== "Spotify" && status.type !== "LISTENING") {
        return message.inlineReply("that user isn't listening to Spotify :pensive:");
    }

    if (status !== null && status.type === "LISTENING" && status.name === "Spotify" && status.assets !== null) {
        let image = `https://i.scdn.co/image/${status.assets.largeImage.slice(8)}`;
        let url = `https:/open.spotify.com/track/${status.syncID}`;
        let name = status.details;
        let artist = status.state;
        let album = status.assets.largeText;

        try {
			const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'spotify-now-playing.png'));
			const { body } = await request.get(image);
			const data = await loadImage(body);
			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, base.width, base.height);
			const height = 504 / data.width;
			ctx.drawImage(data, 66, 132, 504, height * data.height);
			ctx.drawImage(base, 0, 0);
			ctx.textBaseline = 'top';
			ctx.textAlign = 'center';
			ctx.font = 'normal bold 25px Noto';
			ctx.fillStyle = 'white';
			ctx.fillText(name, base.width / 2, 685);
			ctx.fillStyle = '#bdbec2';
			ctx.font = '20px Noto';
			ctx.fillText(artist, base.width / 2, 720);
			ctx.fillText(album, base.width / 2, 65);
            const attachment = canvas.toBuffer();
			return message.channel.send(`${user.username} is listening to ${name} on Spotify!\ncheck out at ${url}`, {files: [{attachment, name: "spotify.png"}]})
		} catch (err) {
			return message.inlineReply(`sorry i got an error :pensive: try again later!`)
		}
    }
}

exports.help = {
    name: "spotify",
    description: "wondering what is that member listening to on Spotify? run this :D\nthis works on yourself as well",
    usage: "spotify `[@user]`",
    example: ["spotify `@bell#9999`", "spotify"]
};
  
exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
	channelPerms: ["ATTACH_FILES"]
}