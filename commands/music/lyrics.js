const { MessageEmbed, Util } = require("discord.js");
const lyricsFinder = require("lyrics-finder");
const { Lyrics } = require("@discord-player/extractor");
const lyricsClient = Lyrics.init(process.env.geniusKey);

exports.run = async(client, message, args) => {
    let lyrics;
    let embed = new MessageEmbed()
        .setColor(message.member.displayHexColor)
    const queue = client.queue.get(message.guild.id);
    const query = args.join(" ");
    if (queue) {
        const info = await lyricsClient.search(queue.songs[0].info.title);
        if (!info) {
            lyrics = await lyricsFinder(queue.songs[0].info.title, '');
            if (!lyrics) return message.inlineReply(`i found no lyrics for current playing song :pensive:`);
            console.log('gg')
            embed.setTitle(`Lyrics for ${queue.songs[0].info.title}`);
        } else {
            console.log('genius')
            embed.setTitle(`Lyrics for ${info.title} by ${info.artist.name}`)
            embed.setThumbnail(info.thumbnail)
            lyrics = info.lyrics;
        };
    } else if (query) {
        const info = await lyricsClient.search(query);
        if (!info) {
            lyrics = await lyricsFinder(query, '');
            if (!lyrics) return message.inlineReply(`i found no lyrics for \`${query}\` :pensive:`);
            console.log('gg')
            embed.setTitle(`Lyrics for ${query}`);
        } else {
            console.log('genius')
            embed.setTitle(`Lyrics for ${info.title} by ${info.artist.name}`)
            embed.setThumbnail(info.thumbnail)
            lyrics = info.lyrics;
        };
    } else {
        return message.inlineReply(`what song do you want me to search the lyric for :thinking: ?`);
    }
    const [first, ...rest] = Util.splitMessage(lyrics, { maxLength: 4000, char: '\n' });

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
            .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
        return message.channel.send(embed3);
    } else {
        embed
            .setTimestamp()
            .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
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