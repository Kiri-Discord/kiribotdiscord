const { MessageEmbed, Util } = require("discord.js");
const lyricsFinder = require("lyrics-finder");
const Genius = require("genius-lyrics");
const genius = new Genius.Client(process.env.geniusKey);

exports.run = async (client, message, args) => {
  let lyrics;
  let embed = new MessageEmbed()
  .setColor(message.member.displayHexColor)
  const queue = client.queue.get(message.guild.id);
  if (queue) {
    const searches = await genius.songs.search(queue.songs[0].title);
    const firstSong = searches[0];
    lyrics = await firstSong.lyrics();
    if (!lyrics) {
      lyrics = await lyricsFinder(queue.songs[0].title, '');
      if (!lyrics) return message.inlineReply(`i found no lyrics for the current playing song :pensive:`);
      embed.setTitle(`Lyrics for ${queue.songs[0].title}`);
    } else {
      embed.setTitle(`Lyrics for ${firstSong.title} - ${firstSong.artist.name}`)
      embed.setThumbnail(firstSong.thumbnail)
    }
  } else {
    const query = args.join(" ");
    if (!query) return message.inlineReply(`what song do you want me to search the lyric for :thinking: ?`);
    const res = await getLyric(query, message, embed);
    lyrics = res.lyrics;
    embed.setTitle(`Lyrics for ${res.title} - ${res.artist}`)
    embed.setThumbnail(res.thumbnail)
    // const searches = await genius.songs.search(query);
    // const firstSong = searches[0];
    // if (!firstSong) return message.inlineReply(`i found no song for ${query} :pensive:`);
    // lyrics = await firstSong.lyrics();
    // if (!lyrics) {
    //   lyrics = await lyricsFinder(query, '');
    //   if (!lyrics) return message.inlineReply(`i found no lyrics for \`${query}\` :(`);
    //   embed.setTitle(`Lyrics for ${query}`);
    // } else {
    //   embed.setTitle(`Lyrics for ${firstSong.title} - ${firstSong.artist.name}`)
    //   embed.setThumbnail(firstSong.thumbnail)
    // }
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
  channelPerms: ["EMBED_LINKS"]
};


async function getLyric(query, message, embed) {
  const searches = await genius.songs.search(query);
  const firstSong = searches[0];
  return {
    type: 'genius',
    title: firstSong.title,
    lyrics: await firstSong.lyrics(),
    thumbnail: firstSong.thumbnail,
    artist: firstSong.artist.name
  }
}