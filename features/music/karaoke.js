const ytdl = require('ytdl-core');
const { parseSync } = require('subtitle');
const format = 'vtt';
const request = require('node-superfetch');
const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");
const ISO6391 = require('iso-639-1');


module.exports = {
    async sing(song, message, channel, lang, queue) {
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
                  const output = await parseSync(body.toString());
                  const subtitles = output
                  .filter(x => x.type = 'cue')
                  .filter(x => x.data.text)
                  .filter(x => x.data.text != '');
                  let embed = new MessageEmbed()
                  .setTitle('Now singing')
                  .setDescription(`[${song.title}](${song.url}) by [${song.author}](${song.authorurl}) [${song.requestedby}]`)
                  .setFooter(`don't know what is this about? karaoke mode is currently set to ON in your guild setting :)`)
                  channel.send(embed);
                  subtitles.forEach(subtitle => {
                    const each = setTimeout(() => {
                      channel.send(subtitle.data.text.toLowerCase().replace("\n", " "))
                    }, subtitle.data.start - 720);
                    queue.karaoke.timeout.push(each);
                  });
                } else {
                    const lyrics = await lyricsFinder(song.title, '');
                    if (!lyrics) return message.channel.send({embed: {color: "f3f3f3", description: `${song.requestedby}, i found no lyrics for **${song.title}** by **${song.author}** in your language \`${ISO6391.getName(lang)}\` :pensive:\nyou can try using an another language.`}});
                    let lyricsEmbed = new MessageEmbed()
                    .setTitle(`Lyrics for ${song.title} by ${song.author}`)
                    .setDescription(lyrics)
                    .setColor('RANDOM')
                    if (lyricsEmbed.description.length >= 2048)
                    lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
                    return channel.send(`${song.requestedby}, i found some lyrics of **${song.title}**, but not in your language \`${ISO6391.getName(lang)}\` :pensive:\nshowing you the lyric that i found on internet instead...\nyou can try using an another language.`, lyricsEmbed);
                }
              } else {
                const lyrics = await lyricsFinder(song.title, '');
                if (!lyrics) return message.channel.send({embed: {color: "f3f3f3", description: `${song.requestedby}, i found no lyrics for **${song.title}** by **${song.author}** in your language \`${ISO6391.getName(lang)}\` :pensive:\nyou can try using an another language.`}});
                let lyricsEmbed = new MessageEmbed()
                .setTitle(`Lyrics for ${song.title} by ${song.author}`)
                .setDescription(lyrics)
                .setColor('RANDOM')
                if (lyricsEmbed.description.length >= 2048)
                lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
                return channel.send(`${song.requestedby}, i found some lyrics of **${song.title}**, but not in your language \`${ISO6391.getName(lang)}\` :pensive:\n*showing you the lyric that i found on internet instead...`, lyricsEmbed);
              }
            } else {
              const lyrics = await lyricsFinder(song.title, '');
              if (!lyrics) return message.channel.send({embed: {color: "f3f3f3", description: `${song.requestedby}, i found no lyrics for **${song.title}** by **${song.author}** :pensive:\n\n*don't know what is this about? auto-scroll lyrics mode is currently set to \`ON\` in your guild setting :)*`}});
              let lyricsEmbed = new MessageEmbed()
              .setTitle(`Lyrics for ${song.title} by ${song.author}`)
              .setDescription(lyrics)
              .setColor('RANDOM')
              if (lyricsEmbed.description.length >= 2048)
              lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
              return channel.send(`${song.requestedby}, i found some lyrics of **${song.title}**, but not in your language \`${ISO6391.getName(lang)}\` :pensive:\n*showing you the lyric that i found on internet instead...`, lyricsEmbed);
            }
        } else {
          return channel.send({embed: {color: "f3f3f3", description: `i'm sorry but auto-scroll lyrics mode doesn't work yet with SoundCloud track :pensive:*`}});
        }
    }
}