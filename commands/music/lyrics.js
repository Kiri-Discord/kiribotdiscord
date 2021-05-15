const { MessageEmbed, Util } = require("discord.js");
const lyricsFinder = require("lyrics-finder");
const AZLyrics = require("azlyrics-ext");

exports.run = async (client, message, args) => {
  let lyrics;
  let embed = new MessageEmbed()
  .setColor(message.member.displayHexColor)
  const queue = client.queue.get(message.guild.id);
  if (queue) {
    const songs = await AZLyrics.search(queue.songs[0].title);
    if (!songs) {
      lyrics = await lyricsFinder(query, '');
      if (!lyrics) return message.inlineReply(`i found no lyrics for current playing song :pensive:`);
      embed.setTitle(`Lyrics for ${queue.songs[0].title}`);
    } else {
      const info = await AZLyrics.getTrack(songs[0].url);
      embed.setTitle(`Lyrics for ${info.title} by ${info.artist}`)
      lyrics = info.lyrics;
    };
  } else {
    const query = args.join(" ");
    if (!query) return message.inlineReply(`what song do you want me to search the lyric for :thinking: ?`);
    const songs = await AZLyrics.search(query);
    if (!songs) {
      lyrics = await lyricsFinder(query, '');
      if (!lyrics) return message.inlineReply(`i found no lyrics for \`${query}\` :pensive:`);
      embed.setTitle(`Lyrics for ${queue.songs[0].title}`);
    } else {
      const info = await AZLyrics.getTrack(songs[0].url);
      embed.setTitle(`Lyrics for ${info.title} by ${info.artist}`)
      lyrics = info.lyrics;
    };
  };
  const [first, ...rest] = Util.splitMessage(lyrics, { maxLength: 2000, char: '\n' });

  if (rest.length) {
    embed.setDescription(first)
    await message.channel.send(embed);
    const lastContent = rest.splice(rest.length - 1, 1);
    for (const text of rest) {
      const embed1 = new MessageEmbed()
      .setColor(message.member.displayHexColor)
      .setDescription(text)
      await message.channel.send(embed1)
    };
    const embed3 = new MessageEmbed()
    .setColor(message.member.displayHexColor)
    .setDescription(lastContent)
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    return message.channel.send(embed3);
  } else {
    embed
    .setTimestamp()
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setColor(message.member.displayHexColor)
    .setDescription(first)
    return message.channel.send(embed);
  }
}

exports.help = {
	name: "lyrics",
	description: "get the lyrics for a song",
	usage: "lyrics <song>",
	example: "lyrics `never let me go`"
};
  
exports.conf = {
	aliases: ["lyric"],
  cooldown: 3,
  guildOnly: true,
  channelPerms: ["EMBED_LINKS"],
  maintenance: true
};