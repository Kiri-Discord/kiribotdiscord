const { MessageEmbed } = require('discord.js');
const { STAY_TIME } = require("../../util/musicutil");
const Guild = require('../../model/music');
const { sing } = require("./karaoke");
const request = require('node-superfetch');
const { embedURL } = require('../../util/util');
const ISO6391 = require('iso-639-1');

module.exports = {
        async play(song, message, client, prefix) {
            let success;

            const queue = client.queue.get(message.guild.id);
            if (queue.karaoke.timeout.length) {
                queue.karaoke.timeout.forEach(x => {
                    clearTimeout(x);
                });
                queue.karaoke.timeout.splice(0, queue.karaoke.timeout.length);
            };
            if (!song) {
                setTimeout(() => {
                    if (queue.player.playing && message.guild.me.voice.channel) return;
                    await client.lavacordManager.leave(queue.textChannel.guild.id)
                    const waveEmoji = client.customEmojis.get('wave') ? client.customEmojis.get('wave') : ':wave:';
                    queue.textChannel.send({ embed: { description: `i'm leaving the voice channel... ${waveEmoji}` } });
                }, STAY_TIME * 1000);
                if (queue.karaoke.timeout.length) {
                    queue.karaoke.timeout.forEach(x => {
                        clearTimeout(x);
                    });
                    queue.karaoke.timeout.splice(0, queue.karaoke.timeout.length);
                };
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
                    node: song.type === 'yt' ? client.lavacordManager.idealNodes[0].id : client.lavacordManager.idealNodes.find(x => x.id === 'sc').id
                }, {
                    selfdeaf: true
                });
            };
            queue.player.once('end', async data => {
                if (data.reason === "FINISHED" || data.reason === "STOPPED") {
                    if (queue.loop) {
                        queue.songs.push(queue.nowPlaying);
                        module.exports.play(queue.songs[0], message, client, prefix);
                    } else {
                        module.exports.play(queue.songs[0], message, client, prefix);
                    };
                };
                if (data.reason === "REPLACED") return;
            });

            try {
                await queue.player.play(song.track);
                queue.nowPlaying = song;
                queue.songs.shift();
                queue.player.volume(queue.volume);
            } catch (error) {
                await client.lavacordManager.leave(queue.textChannel.guild.id);
                client.queue.delete(message.guild.id);
                return queue.textChannel.send({ embed: { description: `**there was an error while playing the music** :pensive:` } });
            }
            if (queue.karaoke.isEnabled) {
                queue.textChannel.send({ embed: { description: `fetching lyrics... :mag_right:` } });
                success = await sing(song, queue.karaoke.channel, queue.karaoke.languageCode, queue, prefix);
            };

            const emoji = {
                'yt': 'youtube',
                'sc': 'soundcloud'
            }
            try {
                const embed = new MessageEmbed()
                    .setDescription(`${emoji[song.type] ? `${client.customEmojis.get(emoji[song.type])} ` : ''}Now playing **${embedURL(song.info.title, song.info.uri)}** by **${song.info.author}** [${song.requestedby}]`)
            if (success) embed.setFooter(`displaying scrolling lyrics (${ISO6391.getName(queue.karaoke.languageCode)}) for this track `)
            await queue.textChannel.send(embed);
        } catch (error) {
            console.error(error);
        }
    },
    async fetchInfo(client, query, search, id) {
        const node = id ? client.lavacordManager.idealNodes.find(x => x.id === id) : client.lavacordManager.idealNodes[0];
        const urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

        const { body } = await request
            .get(`http://${node.host}:${node.port}/loadtracks`)
            .set({ Authorization: node.password })
            .query({
                identifier: urlRegex.test(query) ? query : `ytsearch:${query}`,
            });
        return body.tracks
    },
};
