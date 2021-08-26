const ytdl = require('ytdl-core');
const { parseSync } = require('subtitle');
const format = 'vtt';
const request = require('node-superfetch');
const { MessageEmbed } = require("discord.js");

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
        this.pauseTimestamp = null;
    };
    async init() {
        if (this.song.type !== 'yt') return this.error(true);
        const info = await ytdl.getInfo(this.song.info.uri);
        const foundCaption = info.player_response.captions;
        if (!foundCaption) return this.error();
        const tracks = foundCaption.playerCaptionsTracklistRenderer.captionTracks;
        if (!tracks || !tracks.length) return this.error();
        const track = tracks.find(t => t.languageCode === this.lang);
        if (!track) return this.error();
        const { body } = await request
            .get(`${track.baseUrl}&fmt=${format !== 'xml' ? format : ''}`);
        const output = parseSync(body.toString());
        const subtitles = output
            .filter(x => x.type = 'cue')
            .filter(x => x.data.text)
            .filter(x => x.data.text != '');
        subtitles.forEach(subtitle => {
            this.slots.push({
                text: subtitle.data.text.replace("\n", " "),
                time: subtitle.data.start - 500
            })
        });
        return true;
    };
    start() {
        if (this.playing) return false;
        this.playing = true;
        this.slots.forEach(subtitle => {
            const each = setTimeout(() => {
                this.channel.send(subtitle.text);
                this.slots.shift();
            }, subtitle.time);
            this.timeout.push(each);
        });
        this.playing = true;
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
    resume() {
        if (this.playing) return false;
        this.slots.forEach(subtitle => {
            const time = subtitle.time - (this.pauseTimestamp - this.queue.player.timestamp);
            if (time < 0) this.slots.shift();
            else {
                subtitle.time = time;
                const each = setTimeout(() => {
                    this.channel.send(subtitle.text);
                    this.slots.shift();
                }, time);
                this.timeout.push(each);
            }
        });
        this.playing = true;
        return true;
    };
    change(channel) {
        this.channel = channel;
    }
    error(type) {
        if (type) {
            this.channel.send({ embed: { description: `i'm sorry but auto-scroll lyrics mode doesn't work yet with SoundCloud track :pensive:*` } });
        } else {
            let embed = new MessageEmbed()
                .setTitle('No real-time lyrics was found :(')
                .setDescription(`**No real-time lyric was found for your song. How to solve this?**\n- Set an another language using \`${this.prefix}al lang <language>\` (takes effect only on your next song)\n- Use \`${this.prefix}lyrics\` to fetch a normal lyric`)
                .setFooter(`don't know what is this about? karaoke mode is currently set to ON in your guild setting`)
            this.channel.send(embed);
        }
        return false;
    }
}