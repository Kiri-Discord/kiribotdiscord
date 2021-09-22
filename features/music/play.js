const { MessageEmbed } = require('discord.js');
const { STAY_TIME } = require("../../util/musicutil");
const Guild = require('../../model/music');
const ScrollingLyrics = require("./karaoke");
const request = require('node-superfetch');
const { embedURL } = require('../../util/util');
const spotifyToYT = require("spotify-to-yt");

module.exports = {
        async play(song, message, client, prefix) {
            let success;

            const queue = client.queue.get(message.guild.id);
            if (!song) {
                setTimeout(async() => {
                    if (!queue.textChannel.guild.me.voice.channel) return;
                    const newQueue = client.queue.get(message.guild.id);
                    if (newQueue) return;
                    await client.lavacordManager.leave(queue.textChannel.guild.id)
                    const waveEmoji = client.customEmojis.get('wave') ? client.customEmojis.get('wave') : ':wave:';
                    queue.textChannel.send({ embeds: [{ description: `i'm leaving the voice channel... ${waveEmoji}` }] });
                }, STAY_TIME * 1000);
                await Guild.findOneAndUpdate({
                    guildId: queue.textChannel.guild.id
                }, {
                    guildId: queue.textChannel.guild.id,
                    volume: queue.volume || 100
                }, {
                    upsert: true,
                    new: true
                })
                return client.queue.delete(queue.textChannel.guild.id);
            };
            if (!queue.player) {
                queue.player = await client.lavacordManager.join({
                    guild: queue.textChannel.guild.id,
                    channel: queue.channel.id,
                    node: client.lavacordManager.idealNodes[0].id
                }, {
                    selfdeaf: true
                });
            };
            queue.player.once('end', async data => {
                if (data.reason === "FINISHED" || data.reason === "STOPPED" || data.reason === "LOAD_FAILED") {
                    if (queue.playingMessage && !queue.playingMessage.deleted && queue.songs.length) await queue.playingMessage.delete();
                    if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
                    if (queue.loop) {
                        queue.songs.push(queue.nowPlaying);
                        const upcoming = queue.songs[0];
                        module.exports.play(upcoming, message, client, prefix);
                    } else {
                        const upcoming = queue.songs[0];
                        module.exports.play(upcoming, message, client, prefix);
                    };
                };
                if (data.reason === "REPLACED") return;
            });
            queue.player.once('start', async data => {
                        if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.start();
                        const emoji = {
                            'yt': 'youtube',
                            'sc': 'soundcloud',
                            'sp': 'spotify'
                        };
                        try {
                            const embed = new MessageEmbed()
                                .setDescription(`${emoji[song.type] ? `${client.customEmojis.get(emoji[song.type])} ` : ''}Now playing **${embedURL(song.info.title, song.info.uri)}** by **${song.info.author}** [${song.requestedby}]`);
                    if (success) embed.setFooter(success);
                    queue.playingMessage = await queue.textChannel.send({ embeds: [embed] });
                } catch (error) {
                    logger.log('error', error);
                };
            });
            if (song.type === 'sp') {
                const logo = client.customEmojis.get('spotify') ? client.customEmojis.get('spotify').toString() : '⚠️';
                const msg = await queue.textChannel.send({ embeds: [{ color: "f3f3f3", description: `${logo} fetching info from Spotify (this might take a while)...` }] });
                const ytUrl = await spotifyToYT.trackGet(song.info.uri);
                msg.delete();
                if (!ytUrl || !ytUrl.url) {
                    queue.songs.shift();
                    await queue.textChannel.send({ embeds: [{ color: "RED", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                    return module.exports.play(queue.songs[0], message, client, prefix);
                };
                try {
                    const [res] = await module.exports.fetchInfo(client, ytUrl.url, false);
                    song.track = res.track;
                } catch (error) {
                    queue.songs.shift();
                    await queue.textChannel.send({ embeds: [{ color: "RED", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                    return module.exports.play(queue.songs[0], message, client, prefix);
                };
            };
            if (queue.karaoke.isEnabled) {
                queue.textChannel.send({ embeds: [{ description: `fetching lyrics... :mag_right:` }] });
                queue.karaoke.instance = new ScrollingLyrics(song, queue.karaoke.channel, queue.karaoke.languageCode, queue, prefix);
                success = await queue.karaoke.instance.init();
                if (!success) queue.karaoke.instance = null;
            };
            try {
                queue.nowPlaying = song;
                queue.songs.shift();
                await queue.player.play(song.track);
                queue.player.volume(queue.volume || 100);
            } catch (error) {
                if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
                await client.lavacordManager.leave(queue.textChannel.guild.id);
                client.queue.delete(queue.textChannel.guild.id);
                return queue.textChannel.send({ embeds: [{ description: `there was an error while playing the music! i had left the voice channel :pensive:` }] });
            };
    },
    async fetchInfo(client, query, search, id) {
        const node = id ? client.lavacordManager.idealNodes.filter(x => x.id !== id)[0] : client.lavacordManager.idealNodes[0];
        const urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

        const { body } = await request
            .get(`http://${node.host}:${node.port}/loadtracks`)
            .set({ Authorization: node.password })
            .query({
                identifier: urlRegex.test(query) ? query : `ytsearch:${query}`,
            });
        return body.tracks;
    },
};
