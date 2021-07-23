const ytdl = require('ytdl-core');
const { parseSync } = require('subtitle');
const format = 'vtt';
const request = require('node-superfetch');
const { MessageEmbed } = require("discord.js");
module.exports = {
    async sing(song, channel, lang, queue, prefix) {
        if (song.type === 'yt') {
            const info = await ytdl.getInfo(song.url);
            const foundCaption = info.player_response.captions;
            if (foundCaption) {
                const tracks = foundCaption.playerCaptionsTracklistRenderer.captionTracks;
                if (tracks && tracks.length) {
                    const track = tracks.find(t => t.languageCode === lang);
                    if (track) {
                        const { body } = await request
                            .get(`${track.baseUrl}&fmt=${format !== 'xml' ? format : ''}`);
                        const output = parseSync(body.toString());
                        const subtitles = output
                            .filter(x => x.type = 'cue')
                            .filter(x => x.data.text)
                            .filter(x => x.data.text != '');
                        subtitles.forEach(subtitle => {
                            const each = setTimeout(() => {
                                channel.send(subtitle.data.text.replace("\n", " "))
                            }, subtitle.data.start - 720);
                            queue.karaoke.timeout.push(each);
                        });
                        return true;
                    } else {
                        let embed = new MessageEmbed()
                            .setTitle('No real-time lyrics was found :(')
                            .setDescription(`**No real-time lyric was found for your song. How to solve this?**\n- Set an another language using \`${prefix}al lang <language>\` (takes effect only on your next song)\n- Use \`${prefix}lyrics\` to fetch a normal lyric`)
                            .setFooter(`don't know what is this about? karaoke mode is currently set to ON in your guild setting`)
                        channel.send(embed);
                        return false;
                    }
                } else {
                    let embed = new MessageEmbed()
                        .setTitle('No real-time lyrics was found :(')
                        .setDescription(`**No real-time lyric was found for your song. How to solve this?**\n- Set an another language using \`${prefix}al lang <language>\` (takes effect only on your next song)\n- Use \`${prefix}lyrics\` to fetch a normal lyric`)
                        .setFooter(`don't know what is this about? karaoke mode is currently set to ON in your guild setting`)
                    channel.send(embed);
                    return false;
                }
            } else {
                let embed = new MessageEmbed()
                    .setTitle('No real-time lyrics was found :(')
                    .setDescription(`**No real-time lyric was found for your song. How to solve this?**\n- Set an another language using \`${prefix}al lang <language>\` (takes effect only on your next song)\n- Use \`${prefix}lyrics\` to fetch a normal lyric`)
                    .setFooter(`don't know what is this about? karaoke mode is currently set to ON in your guild setting`)
                channel.send(embed);
                return false;
            }
        } else {
            return channel.send({ embed: { color: "f3f3f3", description: `i'm sorry but auto-scroll lyrics mode doesn't work yet with SoundCloud track :pensive:*` } });
        }
    }
}