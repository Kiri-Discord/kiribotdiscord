const ytdl = require('ytdl-core');
const { parseSync } = require('subtitle');
const format = 'vtt';
const request = require('node-superfetch');
const { MessageEmbed } = require("discord.js");
const ISO6391 = require('iso-639-1');
module.exports = {
    async sing(song, channel, lang, queue) {
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
                  let embed = new MessageEmbed()
                  .setTitle('Now singing')
                  .setDescription(`[${song.title}](${song.url}) by [${song.author}](${song.authorurl}) [${song.requestedby}]`)
                  .setFooter(`don't know what is this about? karaoke mode is currently set to ON in your guild setting`)
                  channel.send(embed);
                  subtitles.forEach(subtitle => {
                    const each = setTimeout(() => {
                      channel.send(subtitle.data.text.toLowerCase().replace("\n", " "))
                    }, subtitle.data.start - 720);
                    queue.karaoke.timeout.push(each);
                  });
                } else {
                    return channel.send({embed: {color: "f3f3f3", description: `${song.requestedby}, i found no lyrics for **${song.title}** by **${song.author}** for your requested language \`${ISO6391.getName(lang)}\` :pensive:\nyou can use \`@sefy lyrics ${song.title.toLowerCase()} - ${song.author.toLowerCase()}\` to fetch it manually :)`}});
                }
              } else {
                return channel.send({embed: {color: "f3f3f3", description: `${song.requestedby}, i found no lyrics for **${song.title}** by **${song.author}** for your requested language \`${ISO6391.getName(lang)}\` :pensive:\nyou can use \`@sefy lyrics ${song.title.toLowerCase()} - ${song.author.toLowerCase()}\` to fetch it manually :)`}});
              }
              return channel.send({embed: {color: "f3f3f3", description: `${song.requestedby}, i found no lyrics for **${song.title}** by **${song.author}** :pensive: \nyou can use \`@sefy lyrics ${song.title.toLowerCase()} - ${song.author.toLowerCase()}\` to fetch it manually :)`, footer: { text: "don't know what is this about? karaoke mode is currently set to ON in your guild setting" }}});
            }
        } else {
          return channel.send({embed: {color: "f3f3f3", description: `i'm sorry but auto-scroll lyrics mode doesn't work yet with SoundCloud track :pensive:*`}});
        }
    }
}