const Discord = require("discord.js");
const convert = require("parse-ms");

exports.run = async (client, message, args) => {
    let user;
    if (message.mentions.users.first()) {
        user = message.mentions.users.first();
    } else {
        user = message.author;
    }

    let status;
    if (user.presence.activities.length === 1) status = user.presence.activities[0];
    else if (user.presence.activities.length > 1) status = user.presence.activities[1];

    if (user.presence.activities.length === 0 || status.name !== "Spotify" && status.type !== "LISTENING") {
        return message.inlineReply("that user isn't listening to Spotify :(");
    }

    if (status !== null && status.type === "LISTENING" && status.name === "Spotify" && status.assets !== null) {
        let image = `https://i.scdn.co/image/${status.assets.largeImage.slice(8)}`,
            url = `https:/open.spotify.com/track/${status.syncID}`,
            name = status.details,
            artist = status.state,
            album = status.assets.largeText,
            timeStart = status.timestamps.start,
            timeEnd = status.timestamps.end,
            timeConvert = convert(timeEnd - timeStart);

        let minutes = timeConvert.minutes < 10 ? `0${timeConvert.minutes}` : timeConvert.minutes;
        let seconds = timeConvert.seconds < 10 ? `0${timeConvert.seconds}` : timeConvert.seconds;
        let time = `${minutes}:${seconds}`;

        const embed = new Discord.MessageEmbed()
        .setAuthor("Spotify", "https://i.pinimg.com/originals/1d/f4/6e/1df46e5b59ceaf54b63302e95644fd80.png")
        .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
        .setColor(0x1ED768)
        .setThumbnail(image)
        .addField("Name:", name, true)
        .addField("Album:", album, true)
        .addField("Artist:", artist, true)
        .addField("Duration:", time, false)
        .addField("Listen now on Spotify!", `[\`${artist} - ${name}\`](${url})`, false)
        return message.channel.send(embed)
    }
}

exports.help = {
    name: "spotify",
    description: "wondering what is that member listening to on Spotify? run this :D\nthis works on yourself as well",
    usage: "spotify `[@user]`",
    example: ["spotify @bell#9999", "spotify"]
};
  
exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
	channelPerms: ["EMBED_LINKS"]
}