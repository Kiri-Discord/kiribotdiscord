const { MessageEmbed, Permissions } = require('discord.js');
const { STAY_TIME } = require("../../util/musicutil");
const Guild = require('../../model/music');
const ScrollingLyrics = require("./karaoke");
const { fetchInfo } = require('../../util/musicutil');
const { embedURL, delay } = require('../../util/util');
const spotifyToYT = require("spotify-to-yt");
const pEvent = require('p-event');

module.exports = class Queue {
    constructor(guildId, client, textChannel, voiceChannel) {
        this.playingMessage = null;
        this.textChannel = textChannel;
        this.channel = voiceChannel;
        this.player = null;
        this.debug = false;
        this.pending = true;
        this.guildId = guildId;
        this.client = client;
        this.songs = [];
        this.loop = false;
        this.repeat = false;
        this.playing = true;
        this.nowPlaying = null;
        this.volume = null;
        this.karaoke = {
            success: null,
            timeout: [],
            channel: null,
            isEnabled: null,
            languageCode: null,
            instance: null,
        }
    };
    async stop(reason) {
        if (reason === 'noSong' || reason === 'selfStop') {
            if (this.client.dcTimeout.has(this.guildId)) {
                const timeout = this.client.dcTimeout.get(this.guildId);
                clearTimeout(timeout);
                this.client.dcTimeout.delete(this.guildId);
            };
            const timeout = setTimeout(async() => {
                if (!this.textChannel.guild.me.voice.channel) return;
                const newQueue = this.client.queue.get(this.guildId);
                if (newQueue) return;
                await this.client.lavacordManager.leave(this.guildId);
                const waveEmoji = this.client.customEmojis.get('wave') ? this.client.customEmojis.get('wave') : ':wave:';
                this.textChannel.send({ embeds: [{ description: `i'm leaving the voice channel... ${waveEmoji}` }] });
            }, STAY_TIME * 1000);
            this.client.dcTimeout.set(this.guildId, timeout);
        };
        this.client.queue.delete(this.guildId);
        if (this.player) {
            if (reason !== 'disconnected') this.player.stop();
            this.player.removeListener('end', this.endEvent);
            this.player.removeListener('start', this.startEvent);
        };
        await Guild.findOneAndUpdate({
            guildId: this.guildId
        }, {
            guildId: this.guildId,
            volume: this.volume || 100
        }, {
            upsert: true,
            new: true
        });
    };
    skip() {
        if (this.karaoke.isEnabled && this.karaoke.instance) this.karaoke.instance.stop();
        let upcoming;
        if (this.loop) {
            this.songs.push(this.nowPlaying);
            upcoming = this.songs[0];
        } else if (this.repeat) {
            upcoming = !this.nowPlaying ? this.songs[0] : this.nowPlaying;
        } else {
            upcoming = this.songs[0];
        };
        this.play(upcoming, false);
    };
    async play(song, noSkip) {
        if (this.client.dcTimeout.has(this.guildId)) {
            const timeout = this.client.dcTimeout.get(this.guildId);
            clearTimeout(timeout);
            this.client.dcTimeout.delete(this.guildId);
        };
        if (!song) {
            return this.stop('noSong');
        };
        let first;
        if (!this.player) {
            this.player = await this.client.lavacordManager.join({
                guild: this.textChannel.guild.id,
                channel: this.channel.id,
                node: this.songs.some(song => song.info.sourceName === 'soundcloud') ? this.client.lavacordManager.idealNodes.filter(x => x.id !== 'yt')[0].id : this.client.lavacordManager.idealNodes[0].id
            }, {
                selfdeaf: true
            });
            if (this.client.config.testSongBase64) {
                this.player.play(this.client.config.testSongBase64, {
                    volume: 80,
                });
                const resolved = await Promise.race([pEvent(this.player, 'end'), delay(5000, 'TIMED_OUT')]);

                if (resolved === 'TIMED_OUT') {
                    const deadEmoji = this.client.customEmojis.get('dead');
                    this.textChannel.send({ embeds: [{ description: `i can't verify if i have joined your channel or not. probably Discord has something to do with it ${deadEmoji} you can create a new queue instead if song won't play.` }] });
                };

            };
            if (this.channel.type === 'GUILD_STAGE_VOICE') {
                if (!this.textChannel.guild.me.permissions.has(Permissions.STAGE_MODERATOR)) {
                    this.client.lavacordManager.leave(this.textChannel.guild.id);
                    return this.textChannel.send({ embeds: [{ description: `you tried to invite me to your Stage Channel, however i'm not a Stage Moderator ;-; you can make me a moderator of that stage then play again!` }] });
                } else {
                    await this.textChannel.guild.me.voice.setSuppressed(false).catch(() => null);
                };
            };
            first = true;

            this.player.on('start', this.startEvent);
            this.player.on('end', this.endEvent);
            this.pending = false;
        };
        if (song.type === 'sp') {
            const logo = this.client.customEmojis.get('spotify') ? this.client.customEmojis.get('spotify').toString() : '⚠️';
            try {
                const msg = await this.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${logo} fetching info from Spotify (this might take a while)...` }] });
                const ytUrl = await spotifyToYT.trackGet(song.info.uri);
                msg.delete();
                if (!ytUrl || !ytUrl.url) {
                    this.songs.shift();
                    await this.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                    return this.play(this.songs[0]);
                };
                const [res] = await fetchInfo(this.client, ytUrl.url, null);
                if (!res) {
                    this.songs.shift();
                    await this.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                    return this.play(this.songs[0]);
                };
                song.track = res.track;
            } catch (error) {
                this.songs.shift();
                await this.textChannel.send({ embeds: [{ color: "RED", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                return this.play(this.songs[0]);
            };
        };
        if (this.karaoke.isEnabled) {
            this.textChannel.send({ embeds: [{ description: `fetching lyrics... :mag_right:` }] });
            this.karaoke.instance = new ScrollingLyrics(song, this.karaoke.channel, this.karaoke.languageCode, this.textChannel, this.client.guildsStorage.get(this.guildId).prefix, this.client);
            const success = await this.karaoke.instance.init();
            if (!success) this.karaoke.instance = null;
        };
        this.nowPlaying = song;
        try {
            if (!this.repeat) this.songs.splice(0, 1);
            this.player.play(song.track, {
                volume: this.volume || 100,
                noReplace: first ? false : noSkip
            });
            if (song.type === 'yt' || song.type === 'sc' || song.type === 'sp') {
                const fetched = await this.client.charts.findOne({
                    songID: song.info.uri,
                });
                if (fetched) {
                    fetched.timesPlayed += 1;
                    await fetched.save();
                } else {
                    const songDB = new this.client.charts({
                        songID: song.info.uri,
                        timesPlayed: 1,
                        songName: song.info.title,
                        songAuthor: song.info.author,
                        songDuration: song.info.duration,
                        type: song.type
                    });
                    await songDB.save();
                };
            };
        } catch (error) {
            console.error(error);
            if (this.karaoke.isEnabled && this.karaoke.instance) this.karaoke.instance.stop();
            this.client.lavacordManager.leave(this.textChannel.guild.id);
            return this.textChannel.send({ embeds: [{ description: `there was an error while playing the music! i had left the voice channel :pensive:` }] });
        };
    };
    startEvent = async(data) => this.start(data);
    endEvent = async(data) => this.end(data);
    async start(data) {
        try {
            let targetEmoji;
            if (this.nowPlaying.type !== 'other') {
                const emoji = {
                    'yt': 'youtube',
                    'sc': 'soundcloud',
                    'sp': 'spotify'
                };
                targetEmoji = emoji[this.nowPlaying.type] ? `${this.client.customEmojis.get(emoji[this.nowPlaying.type])} ` : '';
            } else {
                targetEmoji = this.client.customEmojis.get(this.nowPlaying.info.sourceName) ? `${this.client.customEmojis.get(this.nowPlaying.info.sourceName)} ` : '';
            };
            const embed = new MessageEmbed().setDescription(`${targetEmoji}Now playing **${embedURL(this.nowPlaying.info.title, this.nowPlaying.info.uri)}** by **${this.nowPlaying.info.author}** [${this.nowPlaying.requestedby}]`);

            if (this.karaoke.isEnabled && this.karaoke.instance) {
                if (this.karaoke.instance.success) embed.setFooter(this.karaoke.instance.success);
                this.karaoke.instance.start();
            };
            if (!this.repeat && !this.textChannel.deleted) {
                const sent = await this.textChannel.send({ embeds: [embed] });
                this.playingMessage = sent.id;
            };
        } catch (error) {
            console.error(error);
        };
    };
    async end(data) {
        if (this.debug) this.textChannel.send({ embeds: [{ description: `[DEBUG]: recieved \`STOP\` event with type \`${data.reason}\`!` }] })
        if (this.playingMessage) {
            if (this.songs.length && !this.repeat || this.loop) this.textChannel.messages.delete(this.playingMessage).catch(() => null);
            this.playingMessage = null;
        };
        if (data.reason === 'REPLACED' || data.reason === "STOPPED") return;
        if (data.reason === "FINISHED" || data.reason === "LOAD_FAILED") {
            if (this.karaoke.isEnabled && this.karaoke.instance) this.karaoke.instance.stop();
            let upcoming;
            if (this.loop) {
                this.songs.push(this.nowPlaying);
                upcoming = this.songs[0];
            } else if (this.repeat) {
                upcoming = !this.nowPlaying ? this.songs[0] : this.nowPlaying;
            } else {
                upcoming = this.songs[0];
            };
            this.play(upcoming);
            if (data.reason === 'LOAD_FAILED') this.textChannel.send({ embeds: [{ color: "RED", description: `sorry, i can't seem to be able to load that song! skipping to the next one for you now...` }] });
        };
    };
};