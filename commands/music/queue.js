// const Pagination = require('discord-paginationembed');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { paginateEmbed } = require('../../util/util');
const moment = require('moment');
require('moment-duration-format');

exports.run = async(client, message, args) => {
        const queue = client.queue.get(message.guild.id);
        if (!queue) return message.channel.send({
            embeds: [{
                description: 'there is nothing to display since i\'m not playing anything :grimacing:'
            }]
        });
        let queueFields = [];
        const nowPlaying = queue.nowPlaying;
        let totalDuration = nowPlaying.info.length;
        queueFields.push(`**NOW**: **[${nowPlaying.info.title}](${nowPlaying.info.uri}) - ${nowPlaying.info.author}** [${nowPlaying.requestedby}]`)
        queue.songs.forEach((track, index) => {
            totalDuration = totalDuration + track.info.length;
            queueFields.push(`\`${index + 1}\` - [${track.info.title}](${track.info.uri}) - ${track.info.author} [${track.requestedby}]`)
        });
        const arrSplitted = [];
        while (queueFields.length) {
            const toAdd = queueFields.splice(0, queueFields.length >= 5 ? 5 : queueFields.length);
            arrSplitted.push(toAdd);
        };
        const arrEmbeds = [];
        arrSplitted.map((item, index) => {
                    const embed = new MessageEmbed()
                        .setAuthor(`Music queue for ${message.guild.name}`, message.guild.iconURL({ size: 4096, dynamic: true }))
                        .setDescription(`Now playing: **[${nowPlaying.info.title}](${nowPlaying.info.uri}) - ${nowPlaying.info.author}** [${nowPlaying.requestedby}]`)
                        .setFooter(`${queue.loop ? 'Currently looping the queue' : `${queue.songs.length} song${queue.songs.length === 1 ? '' : 's'} left in queue`} (queue duration: ${moment.duration(totalDuration).format('H[h] m[m] s[s]')})`)
                    .addField('\u200b', item.join('\n'));
    arrEmbeds.push(embed);
    });
    const components = [];
    if (arrEmbeds.length > 1) {
        components.push(
            new MessageButton()
            .setCustomId("previousbtn")
            .setEmoji(client.customEmojis.get('left') ? client.customEmojis.get('left').id : '⬅️')
            .setStyle("SECONDARY"),
            new MessageButton()
            .setCustomId('jumpbtn')
            .setEmoji(client.customEmojis.get('jump') ? client.customEmojis.get('jump').id : '↗️')
            .setStyle('SECONDARY'),
            new MessageButton()
            .setCustomId("nextbtn")
            .setEmoji(client.customEmojis.get('right') ? client.customEmojis.get('right').id : '➡️')
            .setStyle("SECONDARY")
        )
    };
    components.push(new MessageButton()
        .setCustomId('clearbtn')
        .setEmoji(client.customEmojis.get('trash') ? client.customEmojis.get('trash').id : '🗑️')
        .setStyle('DANGER'));
    const row = new MessageActionRow()
        .addComponents(components);
    const msg = await message.channel.send({
        embeds: [arrEmbeds[0]],
        components: [row],
        content: `page 1 of ${arrEmbeds.length}`,
    });
    const filter = async res => {
        if (res.user.id !== message.author.id) {
            await res.reply({
                embeds: [{
                    description: `those buttons are for ${message.author.toString()} :pensive:`
                }],
                ephemeral: true
            });
            return false;
        } else {
            await res.deferUpdate();
            return true;
        }
    };
    return paginateEmbed(arrEmbeds, msg, row, filter, message);
};


exports.help = {
    name: "queue",
    description: "display the music queue that i'm playing",
    usage: ["queue"],
    example: ["queue"]
};

exports.conf = {
    aliases: ["q"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};