const { MessageEmbed } = require('discord.js');
const { STAY_TIME } = require("../../util/musicutil");
const Guild = require('../../model/music');
const ScrollingLyrics = require("./karaoke");
const request = require('node-superfetch');
const { embedURL, delay } = require('../../util/util');
const spotifyToYT = require("spotify-to-yt");

module.exports = {
        async play(song, guildId, client, prefix, noSkip) {
            let success;
            const queue = client.queue.get(guildId);
            if (!queue) return;
            if (!song) {
                setTimeout(async() => {
                    if (!queue.textChannel.guild.me.voice.channelId) return;
                    const newQueue = client.queue.get(guildId);
                    if (newQueue) return;
                    await client.lavacordManager.leave(guildId);
                    const waveEmoji = client.customEmojis.get('wave') ? client.customEmojis.get('wave') : ':wave:';
                    queue.textChannel.send({ embeds: [{ description: `i'm leaving the voice channel... ${waveEmoji}` }] });
                }, STAY_TIME * 1000);
                await Guild.findOneAndUpdate({
                    guildId: guildId
                }, {
                    guildId: guildId,
                    volume: queue.volume || 100
                }, {
                    upsert: true,
                    new: true
                });
                
                return client.queue.delete(guildId);
            }
            if (!queue.player) {
                queue.player = await client.lavacordManager.join({
                    guild: queue.textChannel.guild.id,
                    channel: queue.channel.id,
                    node: client.lavacordManager.idealNodes[0].id
                }, {
                    selfdeaf: true
                });
                if (!queue.textChannel.guild.me.voice.channelId) {
                    await delay(2000);
                    const tried = [];
                    while (!queue.textChannel.guild.me.voice.channelId) {
                        if (tried.length === client.lavacordManager.nodes.size) {
                            await queue.textChannel.send({ embeds: [{ color: "RED", description: `i can't join your voice channel somehow. probably Discord has something to do with it or my music nodes are down :pensive:` }] });
                            await queue.player.destroy();
                            return client.queue.delete(queue.textChannel.guild.id);
                        };
                        const tryCount = tried.length || 0;
                        await queue.textChannel.send({ embeds: [{ color: "RED", description: `:x: failed to join your voice channel! i'm attempting to reconnect with other nodes.. (${tryCount + 1}/${client.lavacordManager.nodes.size})` }] });
                        await queue.player.destroy();
                        await client.lavacordManager.leave(queue.textChannel.guild.id);
                        await delay(3000);
                        queue.player = await client.lavacordManager.join({
                            guild: queue.textChannel.guild.id,
                            channel: queue.channel.id,
                            node: client.lavacordManager.idealNodes.filter(x => !tried.includes(x.host))[0].id
                        }, {
                            selfdeaf: true
                        });
                        await delay(2000);
                        if (!queue.textChannel.guild.me.voice.channelId) {
                            tried.push(queue.player.node.host);
                            continue;
                        };
                    };
                };
                queue.player.on('skip', () => {
                    let upcoming;
                    if (queue.loop) {
                        queue.songs.push(queue.nowPlaying);
                        upcoming = queue.songs[0];
                    } else if (queue.repeat) {
                        upcoming = !queue.nowPlaying ? queue.songs.shift() : queue.nowPlaying;
                    } else {
                        upcoming = queue.songs[0];
                    };
                    return module.exports.play(upcoming, guildId, client, prefix, false);
                })
                queue.player.on('end', async data => {
                    if (!queue) return;
                    if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
                    const playingMessage = await queue.textChannel.messages.fetch(queue.playingMessage).catch(() => null);
                    if (playingMessage !== undefined && !playingMessage.deleted && queue.songs.length) playingMessage.delete();
                    if (data.reason === 'REPLACED') return;
                    if (data.reason === "FINISHED" || data.reason === "STOPPED" || data.reason === "LOAD_FAILED") {
                        let upcoming;
                        if (queue.loop) {
                            queue.songs.push(queue.nowPlaying);
                            upcoming = queue.songs[0];
                        } else if (queue.repeat) {
                            upcoming = !queue.nowPlaying ? queue.songs.shift() : queue.nowPlaying;
                        } else {
                            upcoming = queue.songs[0];
                        };
                        if (upcoming === null || upcoming === undefined) {
                            setTimeout(async() => {
                                if (!queue.textChannel.guild.me.voice.channelId) return;
                                const newQueue = client.queue.get(guildId);
                                if (newQueue) return;
                                await client.lavacordManager.leave(guildId);
                                const waveEmoji = client.customEmojis.get('wave') ? client.customEmojis.get('wave') : ':wave:';
                                queue.textChannel.send({ embeds: [{ description: `i'm leaving the voice channel... ${waveEmoji}` }] });
                            }, STAY_TIME * 1000);
                            await Guild.findOneAndUpdate({
                                guildId: guildId
                            }, {
                                guildId: guildId,
                                volume: queue.volume || 100
                            }, {
                                upsert: true,
                                new: true
                            });
                            
                            return client.queue.delete(guildId);
                        } else {
                            module.exports.play(upcoming, guildId, client, prefix);
                        };
                    };
                });
                queue.player.on('start', async data => {
                            queue.nowPlaying.startedPlaying = Date.now();
                            if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.start();
                            const emoji = {
                                'yt': 'youtube',
                                'sc': 'soundcloud',
                                'sp': 'spotify'
                            };
                            try {
                                const embed = new MessageEmbed()
                                    .setDescription(`${emoji[queue.nowPlaying.type] ? `${client.customEmojis.get(emoji[queue.nowPlaying.type])} ` : ''}Now playing **${embedURL(queue.nowPlaying.info.title, queue.nowPlaying.info.uri)}** by **${queue.nowPlaying.info.author}** [${queue.nowPlaying.requestedby}]`);
                    if (success) embed.setFooter(success);
                    const playingMessage = await queue.textChannel.send({ embeds: [embed] });
                    queue.playingMessage = playingMessage.id;
                } catch (error) {
                    logger.log('error', error);
                };
            });
            queue.pending = false;
        };
        if (song.type === 'sp') {
            const logo = client.customEmojis.get('spotify') ? client.customEmojis.get('spotify').toString() : '⚠️';
            const msg = await queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${logo} fetching info from Spotify (this might take a while)...` }] });
            const ytUrl = await spotifyToYT.trackGet(song.info.uri);
            msg.delete();
            if (!ytUrl || !ytUrl.url) {
                queue.songs.shift();
                await queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                return module.exports.play(queue.songs[0], guildId, client, prefix);
            };
            try {
                const [res] = await module.exports.fetchInfo(client, ytUrl.url, false);
                if (!res) {
                    queue.songs.shift();
                    await queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                    return module.exports.play(queue.songs[0], guildId, client, prefix);
                };
                song.track = res.track;
            } catch (error) {
                queue.songs.shift();
                await queue.textChannel.send({ embeds: [{ color: "RED", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                return module.exports.play(queue.songs[0], guildId, client, prefix);
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
            if (!queue.repeat) queue.songs.shift();
            await queue.player.play(song.track, {
                volume: queue.volume || 100,
                noReplace: noSkip
            });
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
