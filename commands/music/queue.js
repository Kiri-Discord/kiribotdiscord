const Pagination = require('discord-paginationembed');
const moment = require('moment');
require('moment-duration-format');

exports.run = async(client, message, args) => {
        const queue = client.queue.get(message.guild.id);
        if (!queue) return message.channel.send('there is nothing to display since i\'m not playing anything :grimacing:');
        let queueFields = [];
        const nowPlaying = queue.nowPlaying;
        const trackList = queue.songs;
        trackList.push(queue.nowPlaying);
        let totalDuration = 0;
        queue.songs.map((track, index) => {
            totalDuration = totalDuration + track.info.length;
            queueFields.push(`\`${index + 1}\` - [${track.info.title}](${track.info.uri}) - ${track.info.author} [${track.requestedby}]`)
        });
        const FieldsEmbed = new Pagination.FieldsEmbed()
            .setArray(queueFields)
            .setElementsPerPage(5)
            .setPageIndicator(true)
            .setAuthorizedUsers([message.author.id])
            .formatField('\u200b', song => song)
            .setChannel(message.channel)

        FieldsEmbed.embed
            .setAuthor(`Music queue for ${message.guild.name}`, message.guild.iconURL({ size: 4096, dynamic: true }))
            .setDescription(`Now playing: **[${nowPlaying.info.title}](${nowPlaying.info.uri}) - ${nowPlaying.info.author}** [${nowPlaying.requestedby}]`)
            .setFooter(`${queue.loop ? 'Currently looping the queue' : `${queue.songs.length} song${queue.songs.length === 1 ? '' : 's'} left in queue`} (queue duration: ${moment.duration(totalDuration).format('H[h] m[m] s[s]')})`)

    FieldsEmbed.build();
};


exports.help = {
    name: "queue",
    description: "display the music queue that i'm playing",
    usage: "queue",
    example: "queue"
};

exports.conf = {
    aliases: ["q"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["MANAGE_MESSAGES", "EMBED_LINKS"]
};