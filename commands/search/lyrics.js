const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");


exports.run = async (client, message, args) => {

    let songs = args.join(" ");

    if (!songs) return message.reply(`you have to provide me a song to get the lyric of :(`)
    
    let lyrics;

    try {
      lyrics = await lyricsFinder(songs, "");
      if (!lyrics) return message.reply(`i found no lyrics for **${songs}** :(`);
    } catch (error) {
        return message.reply(`i found no lyrics for **${songs}** :(`);
    }

    let each = lyrics.slice().trim().split(/ +/g);

    let lyricsEmbed = new MessageEmbed()
    .setTitle(`Lyrics for ${songs}`)
    .setDescription(lyrics)
    .setColor('RANDOM')
    .setTimestamp()
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))

    if (lyricsEmbed.description.length >= 2048)
      lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
    return message.channel.send(lyricsEmbed).catch(console.error);
}

exports.help = {
	name: "lyrics",
	description: "get the lyrics for a song",
	usage: "lyrics <song>",
	example: "lyrics `never let me go`"
};
  
exports.conf = {
	aliases: ["lyric"],
  cooldown: 7,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
