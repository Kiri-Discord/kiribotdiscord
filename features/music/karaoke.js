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
            const tracks = info
            .player_response.captions
            .playerCaptionsTracklistRenderer.captionTracks;

    
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
                      channel.send(subtitle.data.text.replace("\n", "").toLowerCase())
                    }, subtitle.data.start);
                    queue.karaoke.timeout.push(each);
                  });
                } else {
                    const lyrics = await lyricsFinder(song.author, song.title);
                    if (!lyrics) return message.reply({embed: {color: "f3f3f3", description: `i found no lyrics for **${song.title}** by **${song.author}** in your language \`${ISO6391.getName(lang)}\` :pensive:\nyou can try using an another language.\n\n*don't know what is this about? auto-scroll lyrics mode is currently set to \`ON\` in your guild setting :)*`}});
                    let lyricsEmbed = new MessageEmbed()
                    .setTitle(`Lyrics for ${song.title} by ${song.author}`)
                    .setDescription(lyrics)
                    .setColor('RANDOM')
                    if (lyricsEmbed.description.length >= 2048)
                    lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
                    return channel.send(`${song.requestedby} sorry, there isn\'t any lyric language of **${song.title}** found in your language \`${ISO6391.getName(lang)}\` :pensive: showing you the lyric that i found on internet instead...\n*don't know what is this about? auto-scroll lyrics mode is currently set to \`ON\` in your guild setting :)*`, lyricsEmbed);
                }
              } else {
                const lyrics = await lyricsFinder(song.author, song.title);
                if (!lyrics) return message.reply({embed: {color: "f3f3f3", description: `i found no lyrics for **${song.title}** by **${song.author}** in your language \`${ISO6391.getName(lang)} :pensive:\nmay be the link you requested from YouTube isn't a song?\n*don't know what is this about? auto-scroll lyrics mode is currently set to \`ON\` in your guild setting :)*`}});
                let lyricsEmbed = new MessageEmbed()
                .setTitle(`Lyrics for ${song.title} by ${song.author}`)
                .setDescription(lyrics)
                .setColor('RANDOM')
                if (lyricsEmbed.description.length >= 2048)
                lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
                return channel.send(`${song.requestedby} sorry, i can't find any lyric of **${song.title}** by **${song.author}** in your language \`${ISO6391.getName(lang)}\`\n*showing you the lyric that i found on internet instead...\n\n*don't know what is this about? auto-scroll lyrics mode is currently set to \`ON\` in your guild setting :)*`, lyricsEmbed);
              }
        } else {
          return channel.send({embed: {color: "f3f3f3", description: `i'm sorry but auto-scroll lyrics mode doesn't work yet with SoundCloud track :pensive:\n\n*don't know what is this about? karaoke mode is currently set to \`ON\` in your guild setting :)*`}});
        }
    }
}