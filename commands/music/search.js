const scdl = require("soundcloud-downloader").default;
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { shortenText } = require('../../util/util');
const { fetchInfo } = require('../../features/music/play');
const moment = require('moment');
require('moment-duration-format');

exports.run = async(client, message, args, prefix, cmd, internal) => {
        if (!args.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you must to provide me a song to search for with \`${prefix}search <title>\`` }] });
        if (!message.member.voice.channel) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `⚠️ you are not in a voice channel!` }] });

        const search = args.join(" ");
        let result = [];
        let options = [];
        try {
            let loadingMessage = await message.channel.send({ embeds: [{ color: "#bee7f7", description: `looking for \`${search}\`` }] });
            message.channel.sendTyping();
            const ytRes = await fetchInfo(client, search, true, 'yt');
            const scRes = await scdl.search({
                query: search,
                resourceType: 'tracks'
            });
            if ((ytRes.length + scRes.total_results) < 1) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] })
            ytRes
                .splice(0, 10)
                .forEach((video) => {
                        result.push({
                                    type: 'yt',
                                    title: shortenText(video.info.title, 90),
                                    url: video.info.uri,
                                    desc: `${shortenText(video.info.author, 45)}${video.info.isStream ? '' : ` | ${shortenText(moment.duration(video.info.length).format('H[h] m[m] s[s]'), 35)}`}`,
                });
            });
        scRes.collection
            .filter(x => x.streamable)
            .splice(0, scRes.collection.length > 10 ? 9 : scRes.collection.length)
            .forEach((track) => {
                result.push({
                    type: 'sc',
                    title: shortenText(track.title, 90),
                    url: track.permalink_url,
                    desc: `${shortenText(track.user.username, 45)} | ${shortenText(moment.duration(track.duration).format('H[h] m[m] s[s]'), 35)}`
                })
            });
        result.forEach((song, index) => {
            options.push({
                label: song.title,
                description: song.desc,
                value: index.toString(),
                emoji: song.type === 'yt' ? client.customEmojis.get('youtube').id : client.customEmojis.get('soundcloud').id
            })
        });
        const menu = new MessageSelectMenu()
        .setCustomId('search')
        .setMaxValues(options.length)
        .setMinValues(1)
        .addOptions(options)
        .setPlaceholder('choose a song <3');
        const row = new MessageActionRow()
        .addComponents(menu)
        const embed = new MessageEmbed()
            .setDescription('select all the song that you want to add in with the menu below! (multiple choices are supported)')
            .setColor("#bee7f7")
            .setFooter('timing out in 30 seconds');
        const msg = await message.channel.send({
            embeds: [embed], 
            components: [row],
        });
        const filter = async (res) => {
            if (res.user.id !== message.author.id) {
                await res.reply({
                    embeds: [{
                        description: `this menu doesn't belong to you :pensive:`
                    }],
                    ephemeral: true
                });
                return false;
            } else {
                return true;
            };
        };
            
        const collector = msg.createMessageComponentCollector({
            componentType: 'SELECT_MENU',
            filter,
            time: 30000,
            max: 1
        });
        let inactive = true;
        collector.on('end', async(res) => {
            if (inactive) {
                row.components.forEach(component => component.setDisabled(true));
                await msg.edit({ 
                    embeds: [{ 
                        color: '#bee7f7', 
                        description: `this command is now inactive :pensive:` 
                    }],
                    components: [row]
                });
            } else {
                if (msg && !msg.deleted) await msg.delete();
            };
            if (loadingMessage && !loadingMessage.deleted) await loadingMessage.delete();
        });
        collector.on('collect', async(res) => {
            inactive = false;
            res.deferUpdate();
            collector.stop();
            if (res.values.length > 1) {
                const bulk = res.values.map(song => result[song]);
                client.commands
                    .get("playlist")
                    .run(client, message, bulk, prefix, true);
            } else {
                const url = result[parseInt(res.values[0])].url;
                client.commands
                    .get("play")
                    .run(client, message, [url], prefix, cmd, internal);
    
            };
        });
    } catch (error) {
        console.error(error);
        return message.reply('there was an error while processing your search! can you try again later? :pensive:').catch(err => logger.log('error', err));
    };
};

exports.help = {
    name: "search",
    description: "search a songs to play from (avaliable for YouTube and SoundCloud)",
    usage: "search `<song name>`",
    example: "search `never gonna give you up`"
}

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    clientPerms: ["CONNECT", "SPEAK"],
}