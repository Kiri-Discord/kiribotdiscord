const { MessageEmbed, Util } = require("discord.js");
const request = require('node-superfetch');
const { shortenText } = require('../../../util/util');

exports.run = async(client, interaction) => {
    let lyrics;
    let embed = new MessageEmbed()
        .setColor(interaction.member.displayHexColor)
    const queue = client.queue.get(interaction.guild.id);
    const query = interaction.options.getString('song');
    await interaction.deferReply();
    if (query) {
        try {
            const { body } = await request
                .post(client.config.lyricURL + 'fetch')
                .set({ Authorization: client.config.lyricsKey })
                .query({
                    song: query
                });
            if (body.notFound) return interaction.editReply(`no lyrics was found for that song :pensive:`);
            if (!body.googleFetch) {
                embed.setTitle(`Lyrics for ${body.title} by ${body.author}`);
                embed.setThumbnail(body.thumbnail);
            } else {
                embed.setTitle(`Lyrics for ${query}`);
            };
            lyrics = body.lyrics;
        } catch (error) {
            return interaction.editReply(`couldn't connect you to the server. try again later :pensive:`);
        };
    } else if (queue && queue.nowPlaying) {
        try {
            const { body } = await request
                .post(client.config.lyricURL + 'fetch')
                .set({ Authorization: client.config.lyricsKey })
                .query({
                    song: `${queue.nowPlaying.info.title} ${queue.nowPlaying.info.author}`
                });
            if (body.notFound) return interaction.editReply(`i found no lyrics for the current playing song :pensive:`);
            if (!body.googleFetch) {
                embed.setTitle(`Lyrics for ${body.title} by ${body.author}`);
                embed.setThumbnail(body.thumbnail);
            } else {
                embed.setTitle(`Lyrics for ${queue.nowPlaying.info.title}`);
            };
            lyrics = body.lyrics;
        } catch (error) {
            return interaction.editReply(`couldn't connect you to the server. try again later :pensive:`);
        };
    } else {
        return interaction.editReply(`what song do you want me to search the lyric for :thinking: ?`);
    };

    const [first, ...rest] = Util.splitMessage(shortenText(lyrics, 12000), { maxLength: 3900, char: '' });

    if (rest.length) {
        embed.setDescription(first)
        await interaction.editReply({ embeds: [embed] });
        const lastContent = rest.pop();
        if (rest.length) {
            for (const text of rest) {
                const embed1 = new MessageEmbed()
                    .setColor(interaction.member.displayHexColor)
                    .setDescription(text)
                await interaction.channel.send({ embeds: [embed1] })
            };
        }
        const embed3 = new MessageEmbed()
            .setColor(interaction.member.displayHexColor)
            .setDescription(lastContent)
            .setFooter({text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
            .setTimestamp()
        return interaction.channel.send({ embeds: [embed3] });
    } else {
        embed
            .setTimestamp()
            .setFooter({text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
            .setColor(interaction.member.displayHexColor)
            .setDescription(first)
        return interaction.editReply({ embeds: [embed] });
    };
};