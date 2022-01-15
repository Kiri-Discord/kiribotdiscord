const { parseSync } = require('subtitle');
const format = 'vtt';
const request = require('node-superfetch');
const { askString } = require("../../util/util");
const ISO6391 = require('iso-639-1');
const languages = require('../../assets/language.json');
const { MessageEmbed } = require('discord.js');

module.exports = class ScrollingLyrics {
    constructor(song, channel, lang, queueChannel, prefix, client) {
        this.song = song;
        this.channel = channel;
        this.lang = lang;
        this.prefix = prefix;
        this.slots = [];
        this.timeout = [];
        this.queueChannel = queueChannel;
        this.playing = false;
        this.playTimestamp = null;
        this.pauseTimestamp = null;
        this.success = null;
        this.client = client;
    };
    async init() {
        if (!this.channel.viewable || this.client.deletedChannels.has(this.channel) || !this.channel.permissionsFor(this.queueChannel.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return this.error('perms');
        let notice = `displaying scrolling lyrics (${languages[this.lang]}) for this track`;
        if (this.song.info.sourceName !== 'youtube') return this.error('notSupported');
        try {
            const captionRequest = await request
                .post(this.client.config.lyricURL + 'subtitle')
                .set({ Authorization: this.client.config.lyricsKey })
                .query({
                    video: this.song.info.uri
                });
            const tracks = captionRequest.body;
            if (tracks.error) return this.error();
            let track = tracks.find(t => t.languageCode === this.lang);
            if (!track) {
                const avaliableLang = tracks.filter(track => languages[track.languageCode]);
                if (!avaliableLang.length) return this.error();
                const list = avaliableLang.map(t => t.languageCode).map((lang, index) => `\`${index + 1}\` - ${languages[lang]}`)
                const emoji = this.client.customEmojis.get('party');
                const embed = new MessageEmbed()
                    .setAuthor({name: `no lyrics for this song in your preferred language (${languages[this.lang]})`})
                    .setDescription(`fortunately, there ${avaliableLang.length === 1 ? 'is' : 'are'} **${avaliableLang.length}** lyric${avaliableLang.length === 1 ? '' : 's'} in other language${avaliableLang.length === 1 ? '' : 's'} avaliable ${emoji}\nchoose your desired language **(1 - ${avaliableLang.length})** or type 'cancel' to skip scrolling lyrics for this song:\n\n${list.join("\n")}`)
                    .setFooter('scrolling lyrics will be temporary turned off for this song if no choices were made :(');
                if (!this.client.deletedChannels.has(this.queueChannel)) await this.queueChannel.send({ embeds: [embed] });
                else this.channel.send({ embeds: [embed] });
                const filter = res => {
                    const number = res.content;
                    if ((isNaN(number) || number > avaliableLang.length || number < 1) && res.content.toLowerCase() !== 'cancel') {
                        return false;
                    } else return true;
                };
                const text = await askString(this.queueChannel, filter);
                if (!text) return this.error('noChoose');

                track = avaliableLang[parseInt(text.content) - 1];
                notice = `displaying scrolling lyrics (${languages[track.languageCode]}) for this track (fallback from ${ISO6391.getName(this.lang)})`
            };
            const { body } = await request.get(`${track.baseUrl}&fmt=${format !== 'xml' ? format : ''}`);

            const output = parseSync(body.toString());
            const subtitles = output
                .filter(x => x.type === 'cue')
                .filter(x => x.data.text)
                .filter(x => x.data.text !== '')
                .filter((sub, index, arr) =>
                    index === arr.findIndex((t) => (
                        t.data.start === sub.data.start && t.data.end === sub.data.end && t.data.text === sub.data.text
                    ))
                );
            subtitles.map((subtitle, index) => {
                this.slots.push({
                    text: subtitle.data.text.replace(/(<([^>]+)>)/gi, "").replace("\n", " "),
                    time: subtitle.data.start - 580,
                    id: index
                })
            });
        } catch (err) {
            console.error(err);
            return this.error();
        }
        return this.success = notice;
    };
    start() {
        if (this.playing) return false;
        this.playing = true;
        this.slots.forEach((subtitle) => {
            const each = setTimeout(() => {
                this.channel.send(subtitle.text).catch(() => null);
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
    resume() {
        if (this.playing) return false;
        const seek = this.pauseTimestamp - this.playTimestamp;
        this.slots.forEach(subtitle => subtitle.time = subtitle.time - seek);
        this.slots = this.slots.filter(x => x.time > 0);
        this.pauseTimestamp = null;
        this.start();
        return true;
    };
    change(channel) {
        this.channel = channel;
    };
    error(type) {
        if (type === 'notSupported') {
            if (!this.client.deletedChannels.has(this.queueChannel)) this.queueChannel.send({ embeds: [{ description: `i'm sorry but auto-scroll lyrics mode works only with YouTube or Spotify source for now :pensive:` }] });
            else this.channel.send({ embeds: [{ description: `i'm sorry but auto-scroll lyrics mode works only with YouTube or Spotify source for now :pensive:` }] });
        } else if (type === 'perms') {
            if (!this.client.deletedChannels.has(this.queueChannel)) this.queueChannel.send({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send lyrics to ${this.channel.toString()}! :pensive:\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again!` }] });
        } else if (type === 'noChoose') {
            return false;
        } else {
            let embed = new MessageEmbed()
                .setTitle('No real-time lyrics was found :(')
                .setDescription(`**No real-time lyric was found for your song. How to solve this?**\n- Set an another language using \`${this.prefix}scrolling-lyrics lang <language>\` (takes effect only on your next song)\n- Use \`${this.prefix}lyrics\` to fetch a normal lyric\n- Find a YouTube song with subtitles, and add it to the queue`)
                .setFooter(`don't know what is this about? karaoke mode is currently set to ON in your guild setting`)
            if (!this.client.deletedChannels.has(this.queueChannel)) this.queueChannel.send({ embeds: [embed] });
        };
        return false;
    };
};