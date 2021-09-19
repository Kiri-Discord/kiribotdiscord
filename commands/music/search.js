const scdl = require("soundcloud-downloader").default;
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { shortenText } = require('../../util/util');
const { fetchInfo } = require('../../features/music/play');
const moment = require('moment');
require('moment-duration-format');

exports.run = async(client, message, args, prefix, cmd, internal) => {
        if (!args.length) return message.channel.send({ embeds: [{ color: "f3f3f3", description: `you must to provide me a song to search for with \`${prefix}search <title>\`` }] });
        if (!message.member.voice.channel) return message.channel.send({ embeds: [{ color: "f3f3f3", description: `⚠️ you are not in a voice channel!` }] });

        const search = args.join(" ");
        let result = [];
        let options = [];
        try {
            let loadingMessage = await message.channel.send({ embeds: [{ color: "#bee7f7", description: `looking for \`${search}\`` }] });
            const ytRes = await fetchInfo(client, search, true);
            const scRes = await scdl.search({
                query: search,
                resourceType: 'tracks'
            });
            if (!(ytRes.length + scRes.total_results) > 0) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] })
            ytRes
                .splice(0, 10)
                .map((video) => {
                        result.push({
                                    type: 'yt',
                                    title: shortenText(video.info.title, 80),
                                    url: video.info.uri,
                                    desc: `${shortenText(video.info.author, 12)} ${video.info.isStream ? '' : ` | ${shortenText(moment.duration(video.info.length).format('H[h] m[m] s[s]'))}`}`,
                })
            });
        scRes.collection
            .filter(x => x.streamable)
            .splice(0, scRes.collection.length > 10 ? 9 : scRes.collection.length)
            .map((track) => {
                result.push({
                    type: 'sc',
                    title: shortenText(track.title, 80),
                    url: track.permalink_url,
                    desc: `${shortenText(track.user.username, 12)} | ${shortenText(moment.duration(track.duration).format('H[h] m[m] s[s]'))}`
                })
            })
        result.map((song, index) => {
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
        
        if (!loadingMessage || loadingMessage.deleted) {
            loadingMessage = await message.channel.send({
                embeds: [embed], 
                components: [row],
            });
        } else {
            await loadingMessage.edit({
                embeds: [embed], 
                components: [row],
            })
        };
        const filter = async (res) => {
            await res.deferUpdate();
            if (res.user.id !== message.author.id) {
                await res.reply({
                    embeds: [{
                        description: `this menu isn't belong to you :pensive:`
                    }],
                    ephemeral: true
                });
                return false;
            } else {
                row.components.forEach(component => component.setDisabled(true));
                await res.editReply({ 
                    embeds: [{ 
                        color: '#bee7f7', 
                        description: `this command is now inactive :pensive:` 
                    }],
                    components: [row]
                });
                return true;
            };
        };
            
        const collected = await loadingMessage.awaitMessageComponent({
			componentType: 'SELECT_MENU',
			filter,
			time: 30000
		});
        if (!collected) {
            row.components.forEach(component => component.setDisabled(true));
            await res.edit({ 
                embeds: [{ 
                    color: '#bee7f7', 
                    description: `this command is now inactive :pensive:` 
                }],
                components: [row]
            });
        };
        if (collected.values.length > 1) {
            const bulk = collected.values.map(song => result[song]);
            await client.commands
                .get("playlist")
                .run(client, message, bulk, prefix, true);
        } else {
            const url = collected.values[0];
            await client.commands
                .get("play")
                .run(client, message, [url], prefix, cmd, internal);

        };
    } catch (error) {
        logger.log('error', error);
        return message.reply('there was an error while processing your search, sorry :pensive:').catch(err => logger.log('error', err));
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