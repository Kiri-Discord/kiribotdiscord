const ytdl = require('ytdl-core');
const lang = 'en';
const { parseSync } = require('subtitle');
const format = 'vtt';
const request = require('node-superfetch');
const { MessageEmbed } = require("discord.js");
const lyricsFinder = require("lyrics-finder");


module.exports = {
    async sing(song, message, client, karaoke) {
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
                  const output = parseSync(body.toString());
                  await output.filter(x => x.type != 'header');
                  output.forEach(subtitle => {
                    setTimeout(() => {
                        karaoke.send(subtitle.data.text)
                    }, subtitle.data.start);
                  });
                } else {
                    const lyrics = await lyricsFinder(song.title, song.author);
                    if (!lyrics) return message.reply({embed: {color: "f3f3f3", description: `i found no lyrics for **${song.title}** by **${song.author}** :pensive:\nmay be the link you requested from YouTube isn't a song?`}});
                    let lyricsEmbed = new MessageEmbed()
                    .setTitle(`Lyrics for ${song.title} by ${song.author}`)
                    .setDescription(lyrics)
                    .setColor('RANDOM')
                    .setTimestamp()
                    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
                    return karaoke.send(`sorry, there isn\'t any karaoke found for **${song.title}** :pensive:\n*showing you the lyric instead...`, lyricsEmbed);
                }
              } else {

              }
        } else {
            
        }
    }
}