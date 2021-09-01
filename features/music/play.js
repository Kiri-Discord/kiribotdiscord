const { MessageEmbed } = require('discord.js');
const { STAY_TIME } = require("../../util/musicutil");
const Guild = require('../../model/music');
const ScrollingLyrics = require("./karaoke");
const request = require('node-superfetch');
const { embedURL } = require('../../util/util');
const ISO6391 = require('iso-639-1');

module.exports = {
        async play(song, message, client, prefix) {
            let success;

            const queue = client.queue.get(message.guild.id);
            if (!song) {
                setTimeout(async() => {
                    const newQueue = client.queue.get(message.guild.id);
                    if (message.guild.me.voice.channel && newQueue) return;
                    if (!message.guild.me.voice.channel) return;
                    await client.lavacordManager.leave(queue.textChannel.guild.id)
                    const waveEmoji = client.customEmojis.get('wave') ? client.customEmojis.get('wave') : ':wave:';
                    queue.textChannel.send({ embed: { description: `i'm leaving the voice channel... ${waveEmoji}` } });
                }, STAY_TIME * 1000);
                await Guild.findOneAndUpdate({
                    guildId: message.guild.id
                }, {
                    guildId: message.guild.id,
                    volume: queue.volume
                }, {
                    upsert: true,
                    new: true
                })
                return client.queue.delete(message.guild.id);
            };
            if (!queue.player) {
                queue.player = await client.lavacordManager.join({
                    guild: queue.textChannel.guild.id,
                    channel: queue.channel.id,
                    node: song.type === 'yt' ? client.lavacordManager.idealNodes[0].id : client.lavacordManager.idealNodes.filter(x => x.id !== 'yt')[0].id
                }, {
                    selfdeaf: true
                });
            };
            queue.player.once('end', async data => {
                if (data.reason === "FINISHED" || data.reason === "STOPPED" || data.reason === "LOAD_FAILED") {
                    if (queue.playingMessage) await queue.playingMessage.delete();
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
            if (queue.karaoke.isEnabled) {
                queue.textChannel.send({ embed: { description: `fetching lyrics... :mag_right:` } });
                queue.karaoke.instance = new ScrollingLyrics(song, queue.karaoke.channel, queue.karaoke.languageCode, queue, prefix);
                success = await queue.karaoke.instance.init();
                if (!success) queue.karaoke.instance = null;
            };
            try {
                await queue.player.play(song.track);
                if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.start();
                queue.nowPlaying = song;
                queue.songs.shift();
                queue.player.volume(queue.volume);
            } catch (error) {
                if (queue.karaoke.isEnabled && queue.karaoke.instance) queue.karaoke.instance.stop();
                await client.lavacordManager.leave(queue.textChannel.guild.id);
                client.queue.delete(message.guild.id);
                return queue.textChannel.send({ embed: { description: `**there was an error while playing the music** :pensive:` } });
            };

            const emoji = {
                'yt': 'youtube',
                'sc': 'soundcloud'
            }
            try {
                const embed = new MessageEmbed()
                    .setDescription(`${emoji[song.type] ? `${client.customEmojis.get(emoji[song.type])} ` : ''}Now playing **${embedURL(song.info.title, song.info.uri)}** by **${song.info.author}** [${song.requestedby}]`)
            if (success) embed.setFooter(`displaying scrolling lyrics (${ISO6391.getName(queue.karaoke.languageCode)}) for this track `)
            queue.playingMessage = await queue.textChannel.send(embed);
        } catch (error) {
            console.error(error);
        }
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
