const { MessageEmbed, Util } = require("discord.js");
const request = require('node-superfetch');
const { shortenText } = require('../../util/util');

exports.run = async(client, message, args) => {
    let lyrics;
    let embed = new MessageEmbed()
        .setColor(message.member.displayHexColor)
    const queue = client.queue.get(message.guild.id);
    const query = args.join(" ");
    message.channel.sendTyping();
    if (query) {
        try {
            const { body } = await request
                .post(client.config.lyricURL + 'fetch')
                .set({ Authorization: client.config.lyricsKey })
                .query({
                    song: query
                });
            if (body.notFound) return message.reply(`no lyrics was found for that song :pensive:`);
            if (!body.googleFetch) {
                embed.setTitle(`Lyrics for ${body.title} by ${body.author}`);
                embed.setThumbnail(body.thumbnail);
            } else {
                embed.setTitle(`Lyrics for ${query}`);
            };
            lyrics = body.lyrics;
        } catch (error) {
            return message.reply(`couldn't connect you to the server. try again later :pensive:`);
        };
    } else if (queue) {
        try {
            const { body } = await request
                .post(client.config.lyricURL + 'fetch')
                .set({ Authorization: client.config.lyricsKey })
                .query({
                    song: `${queue.nowPlaying.info.title} ${queue.nowPlaying.info.author}`
                });
            if (body.notFound) return message.reply(`i found no lyrics for the current playing song :pensive:`);
            if (!body.googleFetch) {
                embed.setTitle(`Lyrics for ${body.title} by ${body.author}`);
                embed.setThumbnail(body.thumbnail);
            } else {
                embed.setTitle(`Lyrics for ${queue.nowPlaying.info.title}`);
            };
            lyrics = body.lyrics;
        } catch (error) {
            return message.reply(`couldn't connect you to the server. try again later :pensive:`);
        };
    } else {
        return message.reply(`what song do you want me to search the lyric for :thinking: ?`);
    };

    const [first, ...rest] = Util.splitMessage(shortenText(lyrics, 12000), { maxLength: 4000, char: '\n' });

    if (rest.length) {
        embed.setDescription(first)
        await message.channel.send({ embeds: [embed] });
        const lastContent = rest.pop();
        if (rest.length) {
            for (const text of rest) {
                const embed1 = new MessageEmbed()
                    .setColor(message.member.displayHexColor)
                    .setDescription(text)
                await message.channel.send({ embeds: [embed1] })
            };
        }
        const embed3 = new MessageEmbed()
            .setColor(message.member.displayHexColor)
            .setDescription(lastContent)
            .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
        return message.channel.send({ embeds: [embed3] });
    } else {
        embed
            .setTimestamp()
            .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
            .setColor(message.member.displayHexColor)
            .setDescription(first)
        return message.channel.send({ embeds: [embed] });
    };
};

exports.help = {
    name: "lyrics",
    description: "get the lyrics for a song",
    usage: ["lyrics `[song]`"],
    example: ["lyrics `never let me go`"]
};

exports.conf = {
    aliases: ["lyric"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};