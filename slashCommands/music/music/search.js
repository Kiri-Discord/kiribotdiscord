// const scdl = require("soundcloud-downloader").default;
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { shortenText } = require('../../../util/util');
const { fetchInfo } = require('../../../util/util');
const moment = require('moment');
require('moment-duration-format');
const playCmd = require('./play');
const playlistCmd = require('./playlist');

exports.run = async(client, interaction, internal) => {

    if (!interaction.member.voice.channel) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `⚠️ you are not in a voice channel!` }], ephemeral: true });
    if (!interaction.member.voice.channel.joinable || !interaction.member.voice.channel.speakable) return interaction.reply({ embeds: [{ color: "#bee7f7", description: "i can't join or talk in the voice channel where you are in. can you check my permission?" }], ephemeral: true });

    const serverQueue = client.queue.get(interaction.guild.id);
    if (serverQueue && channel.id !== interaction.guild.me.voice.channel.id) {
        const voicechannel = serverQueue.channel
        return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i have already been playing music in your server! join ${voicechannel} to listen and search :smiley:` }], ephemeral: true });
    };

    const search = interaction.options.getString('query');
    let result = [];
    let options = [];
    let lavalinkRes = []
    try {
        if (!interaction.deferred) await interaction.deferReply();

        let ytRes = await fetchInfo(client, search, null, 'yt');
        let scRes = await fetchInfo(client, search, 'scsearch', 'yt');
        if ((ytRes.length + scRes.length) < 1) return interaction.editReply({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
        ytRes
            .splice(0, 9)
            .forEach(song => {
                song.type = 'yt';
                song.requestedby = interaction.user;
                lavalinkRes.push(song);
                const duration = song.info.isStream ? '[LIVE]' : ` | ${shortenText(moment.duration(song.info.length).format('H[h] m[m] s[s]'), 35)}`;
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
                song.requestedby = interaction.user;
                lavalinkRes.push(song);
                const duration = song.info.isStream ? '[LIVE]' : ` | ${shortenText(moment.duration(song.info.length).format('H[h] m[m] s[s]'), 35)}`;
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
            .setFooter('timing out in 30 seconds');
        const msg = await interaction.editReply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });
        const filter = async(res) => {
            if (res.user.id !== interaction.user.id) {
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
        collector.on('end', async() => {
            if (inactive) {
                row.components.forEach(component => component.setDisabled(true));
                return msg.editReply({
                    embeds: [{
                        color: '#bee7f7',
                        description: `this command is now inactive :pensive:`
                    }],
                    components: [row]
                });
            };
        });
        collector.on('collect', async(res) => {
            inactive = false;
            res.deferUpdate();
            collector.stop();
            if (res.values.length > 1) {
                const bulk = res.values.map(song => lavalinkRes[song]);
                return playlistCmd.run(client, interaction, internal, bulk);
            } else {
                const song = lavalinkRes[parseInt(res.values[0])];
                return playCmd.run(client, interaction, internal, song);
            };
        });
    } catch (error) {
        console.error(error);
        return interaction.followUp('there was an error while processing your search! can you try again later? :pensive:').catch(err => logger.log('error', err));
    };
};