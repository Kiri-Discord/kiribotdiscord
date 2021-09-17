const ytdl = require('ytdl-core');
const { parseSync } = require('subtitle');
const format = 'vtt';
const request = require('node-superfetch');
const { MessageEmbed } = require("discord.js");
const ISO6391 = require('iso-639-1');

module.exports = class ScrollingLyrics {
    constructor(song, channel, lang, queue, prefix) {
        this.song = song;
        this.channel = channel;
        this.lang = lang;
        this.queue = queue;
        this.prefix = prefix;
        this.slots = [];
        this.timeout = [];
        this.playing = false;
        this.playTimestamp = null;
        this.pauseTimestamp = null;
    };
    async init() {
        let notice = `displaying scrolling lyrics (${ISO6391.getName(this.lang)}) for this track`;
        if (this.song.type !== 'yt') return this.error('sc');
        const info = await ytdl.getInfo(this.song.info.uri);
        const foundCaption = info.player_response.captions;
        if (!foundCaption) return this.error();
        const tracks = foundCaption.playerCaptionsTracklistRenderer.captionTracks;
        if (!tracks || !tracks.length) return this.error();
        let track = tracks.find(t => t.languageCode === this.lang);
        if (!track) {
            track = tracks[0];
            notice = `displaying scrolling lyrics (${ISO6391.getName(track.languageCode)}) for this track (fallback from ${ISO6391.getName(this.lang)})`
        };
        const { body } = await request
            .get(`${track.baseUrl}&fmt=${format !== 'xml' ? format : ''}`);
        const output = parseSync(body.toString());
        const subtitles = output
            .filter(x => x.type = 'cue')
            .filter(x => x.data.text)
            .filter(x => x.data.text != '');
        subtitles.map((subtitle, index) => {
            this.slots.push({
                text: subtitle.data.text.replace("\n", " "),
                time: subtitle.data.start - 500,
                id: index
            })
        });
        return notice;
    };
    start() {
        if (this.playing) return false;
        this.playing = true;
        this.slots.forEach(subtitle => {
            const each = setTimeout(() => {
                this.channel.send(subtitle.text);
                this.slots.splice(this.slots.findIndex(x => x.id === subtitle.id), 1);
            }, subtitle.time);
            this.timeout.push(each);
        });
        this.playing = true;
        this.playTimestamp = Date.now();
        return true;
    };
    pause(timestamp) {
        if (!this.playing) return false;
        this.timeout.forEach(each => {
            clearTimeout(each);
        });
        this.timeout = [];
        this.playing = false;
        this.pauseTimestamp = timestamp;
        return true;
    };
    stop() {
        if (!this.playing) return false;
        this.timeout.forEach(x => {
            clearTimeout(x);
        })
        this.slots = [];
        this.timeout = [];
        this.playing = false;
        return true;
    }
    resume(player) {
        if (this.playing) return false;
        const seek = this.pauseTimestamp - this.playTimestamp;
        this.slots.forEach(subtitle => subtitle.time = subtitle.time - seek);
        this.slots = this.slots.filter(x => x.time > 0);
        this.start();
        player.resume();
        return true;
    };
    change(channel) {
        this.channel = channel;
    }
    error(type) {
        if (type === 'sc') {
            this.channel.send({ embeds: [{ description: `i'm sorry but auto-scroll lyrics mode doesn't work yet with SoundCloud track :pensive:` }] });
        } else {
            let embed = new MessageEmbed()
                .setTitle('No real-time lyrics was found :(')
                .setDescription(`**No real-time lyric was found for your song. How to solve this?**\n- Set an another language using \`${this.prefix}scrolling-lyrics lang <language>\` (takes effect only on your next song)\n- Use \`${this.prefix}lyrics\` to fetch a normal lyric`)
                .setFooter(`don't know what is this about? karaoke mode is currently set to ON in your guild setting`)
            this.channel.send({ embeds: [embed] });
        }
        return false;
    }
}