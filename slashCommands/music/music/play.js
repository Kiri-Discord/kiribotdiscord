const Queue = require("../../../features/music/play");
const { fetchInfo } = require('../../../util/musicutil');
const { MessageEmbed } = require('discord.js');
const scdl = require("soundcloud-downloader").default;
const { DEFAULT_VOLUME } = require("../../../util/musicutil");
const validUrl = require('valid-url');
const Guild = require('../../../model/music');
const { verify, verifyLanguage, embedURL } = require('../../../util/util');
const { getTracks } = require('spotify-url-info');
const searchCmd = require('./search');
const playlistCmd = require('./playlist');

exports.run = async(client, interaction, internal, bulkAdd) => {
    const { channel } = interaction.member.voice;
    const serverQueue = client.queue.get(interaction.guild.id);
    if (!channel) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `⚠️ you are not in a voice channel!` }], ephemeral: true });
    if (!channel.joinable || !channel.speakable) return interaction.reply({ embeds: [{ color: "#bee7f7", description: "i can't join or talk in the voice channel where you are in. can you check my permission?" }], ephemeral: true });
    if (serverQueue && channel.id !== interaction.guild.me.voice.channel.id) {
        const voicechannel = serverQueue.channel
        return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i have already been playing music in your server! join ${voicechannel} to listen :smiley:` }], ephemeral: true });
    };

    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const spotifyRegex = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist|episode|show)(?::|\/)((?:[0-9a-zA-Z]){22})/;
    const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
    let url = interaction.options.getString('query');


    const urlValid = videoPattern.test(url);

    if (!videoPattern.test(url) && playlistPattern.test(url)) {
        return playlistCmd.run(client, interaction);
    } else if (scdl.isValidUrl(url) && url.includes("/sets/")) {
        return playlistCmd.run(client, interaction);
    } else if (url.match(spotifyRegex)) {
        const match = url.match(spotifyRegex);
        const albumOrTrack = match[1];
        if (albumOrTrack === 'album' || albumOrTrack === 'playlist') return playlistCmd.run(client, interaction);
    };

    const musicSettings = await Guild.findOne({
        guildId: interaction.guild.id
    });
    if (!interaction.deferred) await interaction.deferReply();

    const queueConstruct = new Queue(interaction.guild.id, client, interaction.channel, channel);
    if (musicSettings && !internal) {
        queueConstruct.karaoke.isEnabled = false;
        queueConstruct.volume = musicSettings.volume;
        const channel = interaction.guild.channels.cache.get(musicSettings.KaraokeChannelID);
        if (musicSettings.KaraokeChannelID && !serverQueue && channel) {
            const msg1 = await interaction.channel.send({ embeds: [{ description: `scrolling lyric mode is now set to \`ON\` in the setting and all lyrics will be sent to ${channel}\ndo you want me to enable this to your queue, too? \`y/n\`\n\nyou only have to do this **ONCE** only for this queue :wink:`, footer: { text: `type 'no' or leave this for 10 second to bypass` } }] });
            const verification = await verify(interaction.channel, interaction.user, { time: 10000 });
            if (verification) {
                const msg2 = await interaction.channel.send({ embeds: [{ description: `nice! okay so what language do you want me to sing in for the upcoming queue?\nresponse in a valid language: for example \`English\` or \`Japanese\` to continue :arrow_right:`, footer: { text: 'this confirmation will timeout in 10 second. type \'cancel\' to cancel this confirmation.' } }] });
                const response = await verifyLanguage(interaction.channel, interaction.user, { time: 10000 });
                if (response.isVerify) {
                    msg1.delete();
                    msg2.delete();
                    queueConstruct.karaoke.languageCode = response.choice;
                    queueConstruct.karaoke.channel = channel;
                    queueConstruct.karaoke.isEnabled = true;
                } else {
                    queueConstruct.karaoke.isEnabled = false;
                    msg1.delete();
                    msg2.delete();
                    interaction.channel.send('you didn\'t answer anything! i will just play the song now...');
                };
            } else {
                msg1.delete();
                if (verification === 0) interaction.channel.send('you didn\'t answer anything! i will just play the song now...');
            };
        };
    } else {
        queueConstruct.karaoke.isEnabled = false;
        queueConstruct.volume = DEFAULT_VOLUME;
    };
    if (internal) {
        queueConstruct.karaoke = internal;
    };
    let song = null;
    if (bulkAdd) {
        song = bulkAdd;
    } else if (urlValid) {
        try {
            [song] = await fetchInfo(client, url, null);
            if (!song) return interaction.editReply({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
            song.type = 'yt';
            song.requestedby = interaction.user;
        } catch (error) {
            logger.log('error', error);
            return interaction.editReply({ embeds: [{ color: "RED", description: `:x: no match were found. try again later :pensive:` }] });
        };
    } else if (scRegex.test(url) || mobileScRegex.test(url)) {
        try {
            const res = await fetchInfo(client, url, null, 'yt');
            if (res.length > 1) {
                res.forEach(each => {
                    each.type = 'sc';
                    each.requestedby = interaction.user;
                });
                return playlistCmd.run(client, interaction, queueConstruct.karaoke, res);
            } else {
                song = res[0];
                if (!song) return interaction.editReply({ embeds: [{ color: "RED", description: `:x: no match were found (SoundCloud tends to break things as i'm are working on my end. try again later!)` }] });
                song.type = 'sc';
                song.requestedby = interaction.user;
            };
        } catch (error) {
            return interaction.editReply({ embeds: [{ color: "RED", description: `:x: no match were found. try again later :pensive:` }] });
        };
    } else if (url.match(spotifyRegex)) {
        const matchs = url.match(spotifyRegex);
        const logo = client.customEmojis.get('spotify') ? client.customEmojis.get('spotify').toString() : '⚠️';
        if (matchs[1] === 'episode' || matchs[1] === 'show') {
            return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `${logo} sorry, i don't support podcast link from Spotify :pensive:` }] });
        };
        try {
            const results = await getTracks(url);
            if (!results || !results.length) return interaction.editReply({ embeds: [{ color: "RED", description: `:x: no match were found. try again later :pensive:` }] });
            const info = results[0];
            song = {
                info: {
                    uri: info.external_urls.spotify,
                    title: info.name,
                    author: info.artists.map(x => x.name).join(", "),
                    length: info.duration_ms
                },
                type: 'sp',
                requestedby: interaction.user
            };
        } catch (error) {
            logger.log('error', error);
            return interaction.editReply({ embeds: [{ color: "RED", description: `:x: no match were found. try again later :pensive:` }] });
        };
    } else if (validUrl.isWebUri(url)) {
        try {
            const res = await fetchInfo(client, url, null, 'yt');
            if (res.length > 1) {
                res.forEach(each => {
                    each.type = 'other';
                    each.requestedby = interaction.user;
                });
                return playlistCmd.run(client, interaction, queueConstruct.karaoke, res);
            } else {
                song = res[0];
                if (!song) return interaction.editReply({ embeds: [{ color: "RED", description: `:x: no match were found` }] });
                song.type = 'other';
                song.requestedby = interaction.user;
            };
        } catch (error) {
            logger.log('error', error);
            return interaction.editReply({ embeds: [{ color: "RED", description: `:x: no match were found. try again later :pensive:` }] });
        };
    } else {
        return searchCmd.run(client, interaction, queueConstruct.karaoke);
    };
    const embed = new MessageEmbed()
        .setDescription(`✅ Added **${embedURL(song.info.title, song.info.uri)}** by **${song.info.author}** to the queue [${song.requestedby}]`)
    if (serverQueue) {
        serverQueue.songs.push(song);
        if (interaction.channel.id !== serverQueue.textChannel.id) serverQueue.textChannel.send({ embeds: [embed] });
        return interaction.editReply({ embeds: [embed], components: [] });
    };
    queueConstruct.songs.push(song);
    client.queue.set(interaction.guild.id, queueConstruct);
    interaction.editReply({ embeds: [embed], components: [] });
    try {
        queueConstruct.play(queueConstruct.songs[0]);
    } catch (error) {
        logger.log('error', error);
        client.queue.delete(interaction.guild.id);
        return interaction.followUp({ embeds: [{ color: "RED", description: `:x: there was an error when i tried to join your voice channel :pensive:` }] }).catch(err => logger.log('error', err));
    };
};