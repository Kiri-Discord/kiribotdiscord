const ytdl = require('ytdl-core');
const lang = 'en';
const { parseSync } = require('subtitle');
const format = 'vtt';
const request = require('node-superfetch');


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
                        channel.send(subtitle.data.text)
                    }, subtitle.data.start);
                  });
    
                } else {
                    karaoke.send();
                }
              } else {
                karaoke.send('No captions found for this video');
              }
        } else {
            
        }
    }
}