const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const { shortenText } = require('../../util/util');
const { fetchInfo, canModifyQueue } = require('../../util/musicutil');
const moment = require('moment');
require('moment-duration-format');

exports.run = async(client, message, args, prefix, cmd, internal) => {
    if (!args.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you must to provide me a song to search for with \`${prefix}search <title>\`` }] });
    const { channel } = message.member.voice;
    if (!channel) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `⚠️ you are not in a voice channel!` }] });


    const serverQueue = client.queue.get(message.guild.id);
    if (serverQueue && !canModifyQueue(message.member)) {
        const voicechannel = serverQueue.channel
        return message.reply({ embeds: [{ color: "#bee7f7", description: `i have already been playing music in your server! join ${voicechannel} to listen and search :smiley:` }] });
    };

    const noPermission = channel.type === 'GUILD_VOICE' ? (!channel.joinable && !channel.speakable) : (!channel.joinable && !channel.manageable);
    if (noPermission) return message.reply({ embeds: [{ color: "#bee7f7", description: "i can't join or talk in the voice channel where you are in. can you check my permission?" }] });

    const search = args.join(" ");
    let result = [];
    let options = [];
    let lavalinkRes = []
    try {
        let loadingMessage = await message.channel.send({ embeds: [{ color: "#bee7f7", description: `looking for \`${search}\`` }] });
        message.channel.sendTyping();
        let ytRes = await fetchInfo(client, search, null, 'yt');
        let scRes = await fetchInfo(client, search, 'scsearch', 'yt');
        if ((ytRes.length + scRes.length) < 1) return message.channel.send({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
        ytRes
            .splice(0, 9)
            .forEach(song => {
                song.type = 'yt';
                song.requestedby = message.author;
                lavalinkRes.push(song);
                const duration = song.info.isStream ? ' [LIVE]' : ` | ${shortenText(moment.duration(song.info.length).format('H[h] m[m] s[s]'), 35)}`;
                result.push({
                    type: song.type,
                    title: shortenText(song.info.title, 90),
                    url: song.info.uri,
                    desc: shortenText(song.info.author, 45) + duration
                });
            });
        scRes
            .splice(0, 9)
            .forEach(song => {
                song.type = 'sc';
                song.requestedby = message.author;
                lavalinkRes.push(song);
                const duration = song.info.isStream ? ' [LIVE]' : ` | ${shortenText(moment.duration(song.info.length).format('H[h] m[m] s[s]'), 35)}`;
                result.push({
                    type: song.type,
                    title: shortenText(song.info.title, 90),
                    url: song.info.uri,
                    desc: shortenText(song.info.author, 45) + duration
                });
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
            .setFooter('timing out in 15 seconds');
        const msg = await message.channel.send({
            embeds: [embed],
            components: [row],
        });
        const filter = async(res) => {
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
        let inactive = true;
        try {
            const response = await msg.awaitMessageComponent({
                componentType: 'SELECT_MENU',
                filter,
                time: 15000,
                max: 1
            });
            inactive = false;
            response.deferUpdate();
            if (msg && msg.deletable) await msg.delete();
            if (loadingMessage && loadingMessage.deletable) await loadingMessage.delete();
            if (response.values.length > 1) {
                const bulk = response.values.map(song => lavalinkRes[song]);
                client.commands
                    .get("playlist")
                    .run(client, message, args, prefix, cmd, internal, bulk);
            } else {
                const song = lavalinkRes[parseInt(response.values[0])];
                client.commands
                    .get("play")
                    .run(client, message, args, prefix, cmd, internal, song);
            };
        } catch {
            if (inactive) {
                row.components.forEach(component => component.setDisabled(true));
                msg.edit({
                    embeds: [{
                        color: '#bee7f7',
                        description: `this command is now inactive! playing the first song for you...`
                    }],
                    components: [row]
                });
                const song = lavalinkRes[0];
                client.commands
                    .get("play")
                    .run(client, message, args, prefix, cmd, internal, song);
            };
        };
    } catch (error) {
        console.error(error);
        return message.reply('there was an error while processing your search! can you try again later? :pensive:').catch(err => logger.log('error', err));
    };
};

exports.help = {
    name: "search",
    description: "search a songs to play from (avaliable for YouTube and SoundCloud)",
    usage: ["search `<song name>`"],
    example: ["search `never gonna give you up`"]
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};