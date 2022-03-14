const { MessageEmbed, Permissions } = require('discord.js');
const { STAY_TIME } = require("../../util/musicutil");
const Guild = require('../../model/music');
const ScrollingLyrics = require("./karaoke");
const { fetchInfo, fetchRelated } = require('../../util/musicutil');
const { embedURL, delay } = require('../../util/util');
const spotifyToYT = require("spotify-to-yt");
const pEvent = require('p-event');
const eq = require('../../assets/equalizer');

module.exports = class Queue {
    constructor(guild, client, textChannel, voiceChannel) {
        this.playingMessage = null;
        this.textChannel = textChannel;
        this.channel = voiceChannel;
        this.player = null;
        this.debug = false;
        this.pending = true;
        this.guildId = guild.id;
        this.guild = guild;
        this.me = null;
        this.client = client;
        this.autoPlay = false;
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
    async init() {
        try {
            this.me = await this.guild.members.fetch(this.client.user);
            return this.me;
        } catch {
            return null;
        }
    }
    async stop(reason) {
        if (this.karaoke.isEnabled && this.karaoke.instance) this.karaoke.instance.stop();
        if (this.dcTimeout) clearTimeout(this.dcTimeout);
        if (reason === 'noSong' || reason === 'selfStop') {
            if (this.client.dcTimeout.has(this.guildId)) {
                const timeout = this.client.dcTimeout.get(this.guildId);
                clearTimeout(timeout);
                this.client.dcTimeout.delete(this.guildId);
            };
            const timeout = setTimeout(async() => {
                if (!this.me.voice.channelId) return;
                const newQueue = this.client.queue.get(this.guildId);
                if (newQueue) return;
                await this.client.lavacordManager.leave(this.guildId);
                const waveEmoji = this.client.customEmojis.get('wave') ? this.client.customEmojis.get('wave') : ':wave:';
                if (!this.client.deletedChannels.has(this.textChannel)) this.textChannel.send({ embeds: [{ description: `i'm leaving the voice channel... ${waveEmoji}` }] });
            }, STAY_TIME * 1000);
            this.client.dcTimeout.set(this.guildId, timeout);
        };
        this.client.queue.delete(this.guildId);
        if (this.player) {
            if (reason === 'errorNode') {
                if (this.channel.permissionsFor(this.me).has(Permissions.FLAGS.MOVE_MEMBERS)) this.me.voice.disconnect();
                this.client.lavacordManager.players.delete(this.guildId);
            } else if (reason === 'destroyOnly') {
                this.player.destroy();
            } else if (reason !== 'disconnected') {
                this.player.stop();
            };
            this.player.removeListener('end', this.endEvent);
            this.player.removeListener('start', this.startEvent);
            this.player.removeListener('pause', this.pauseEvent);
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
    pause() {
        this.playing = false;
        this.player.pause(true);
        this.dcTimeout = setTimeout(async() => {
            const embed = new MessageEmbed()
                .setTitle("it's lonely here :(")
                .setDescription(`it's been a while since the music queue was paused, so i left the voice channel to reserve data :pensive:\nto keep me staying the the voice chat 24/7, there is a upcoming command called \`${this.client.config.prefix}24/7\` for supporters! stay tuned <3`)
            if (!this.client.deletedChannels.has(this.textChannel)) this.textChannel.send({ embeds: [embed] });
            this.dcTimeout = undefined;
            return this.client.lavacordManager.leave(this.guild.id);
        }, STAY_TIME * 1000);
        return true;
    }
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
    async initVc(node, voiceState) {
        if (!this.pending) this.pending = true;
        let targetNode;
        if (node) {
            targetNode = node.id;
        } else {
            targetNode = this.songs.some(song => song.info.sourceName === 'soundcloud') ? this.client.lavacordManager.idealNodes.filter(x => x.id !== 'yt')[0].id : this.client.lavacordManager.idealNodes[0].id;
        }
        if (this.player) {
            this.player.removeListener('end', this.endEvent);
            this.player.removeListener('start', this.startEvent);
            this.player.removeListener('pause', this.pauseEvent);
        }
        this.player = await this.client.lavacordManager.join({
            guild: this.guildId,
            channel: this.channel.id,
            node: targetNode
        }, {
            selfdeaf: true
        });
        if (voiceState) await this.player.connect(voiceState);
        await delay(1500);
        if (!this.me.voice.channelId) {
            const tried = [];
            tried.push(targetNode.host);
            while (!this.me.voice.channelId) {
                if (tried.length === this.client.lavacordManager.nodes.size) {
                    this.stop('destroyOnly')
                    return 'TRIED_TO_JOIN_WITH_NODES';
                };
                const tryCount = tried.length;
                if (!this.client.deletedChannels.has(this.textChannel)) await this.textChannel.send({ embeds: [{ color: "RED", description: `:x: failed to join your voice channel! i'm attempting to reconnect with other nodes.. (${tryCount + 1}/${this.client.lavacordManager.nodes.size})` }] });
                await this.client.lavacordManager.leave(this.guildId);
                await delay(1500);
                const nextNode = this.songs.some(song => song.info.sourceName === 'soundcloud') ? this.client.lavacordManager.idealNodes.filter(x => !tried.includes(x.host) && x.id !== 'yt')[0] : this.client.lavacordManager.idealNodes.filter(x => !tried.includes(x.host))[0];
                if (!nextNode) {
                    this.stop('destroyOnly')
                    return 'TRIED_TO_JOIN_WITH_NODES';
                }
                this.player = await this.client.lavacordManager.join({
                    guild: this.guildId,
                    channel: this.channel.id,
                    node: nextNode.id
                }, {
                    selfdeaf: true
                });
                if (!this.me.voice.channelId) {
                    tried.push(nextNode.host);
                    await delay(1500);
                    continue;
                };
            };
        };
        if (this.client.config.testSongBase64) {
            try {
                await this.player.play(this.client.config.testSongBase64, {
                    volume: 80,
                    noSkip: false
                });
                const resolved = await Promise.race([pEvent(this.player, 'end'), delay(5000, 'TIMED_OUT')]);

                if (resolved === 'TIMED_OUT') {
                    this.stop('disconnected');
                    this.client.lavacordManager.leave(this.guildId);
                    return 'CANT_VERIFY';
                };
            } catch {
                null;
            };
        };
        this.player.on('start', this.startEvent);
        this.player.on('end', this.endEvent);
        this.player.on('pause', this.pauseEvent);
        this.pending = false;

        return true;
    }
    async play(song, noSkip) {
        if (this.client.dcTimeout.has(this.guildId)) {
            const timeout = this.client.dcTimeout.get(this.guildId);
            clearTimeout(timeout);
            this.client.dcTimeout.delete(this.guildId);
        };
        if (!song) {
            return this.stop('noSong');
        };
        if (!this.player || !this.player.state.connected) {
            const state = await this.initVc();
            if (state === 'TRIED_TO_JOIN_WITH_NODES' && !this.client.deletedChannels.has(this.textChannel)) {
                return this.textChannel.send({ embeds: [{ color: "RED", description: `i can't join your voice channel somehow. probably Discord has something to do with it or my music nodes are down :pensive:` }] });
            } else if (state === 'CANT_VERIFY' && !this.client.deletedChannels.has(this.textChannel)) {
                const deadEmoji = this.client.customEmojis.get('dead');
                return this.textChannel.send({ embeds: [{ description: `i can't verify if i have joined your channel or not. probably Discord has something to do with it ${deadEmoji} you can create a new queue instead if song won't play.` }] });
            }
        };
        if (this.channel.type === 'GUILD_STAGE_VOICE' && this.me.voice.suppress) {
            if (!this.me.permissions.has(Permissions.STAGE_MODERATOR)) {
                this.me.voice.setRequestToSpeak(true);
                if (!this.client.deletedChannels.has(this.textChannel)) this.textChannel.send({ embeds: [{ description: `i am in your Stage Channel, however since i'm not a speaker, i can't play your song publicly ;-; you can invite me to speak using **Right Click** -> **Invite to Speak** or accept my speak request!` }] });
            } else {
                await this.me.voice.setSuppressed(false);
            };
        };
        if (song.type === 'sp' && !song.track) {
            const logo = this.client.customEmojis.get('spotify') ? this.client.customEmojis.get('spotify').toString() : '⚠️';
            try {
                let msg;
                if (!this.client.deletedChannels.has(this.textChannel)) msg = await this.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${logo} fetching info from Spotify (this might take a while)...` }] });
                const ytUrl = await spotifyToYT.trackGet(song.info.uri);
                if (!ytUrl || !ytUrl.url) {
                    this.songs.shift();
                    if (msg && msg.editable) await msg.edit({ embeds: [{ color: "#bee7f7", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                    else if (!this.client.deletedChannels.has(this.textChannel)) await this.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                    return this.play(this.songs[0]);
                };
                song.info.originalUrl = ytUrl.url;
                const [res] = await fetchInfo(this.client, ytUrl.url, null);
                if (!res) {
                    this.songs.shift();
                    if (msg && msg.editable) await msg.edit({ embeds: [{ color: "#bee7f7", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                    else if (!this.client.deletedChannels.has(this.textChannel)) await this.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                    return this.play(this.songs[0]);
                };
                song.loadingMessage = msg;
                song.track = res.track;
            } catch (error) {
                this.songs.shift();
                if (!this.client.deletedChannels.has(this.textChannel)) await this.textChannel.send({ embeds: [{ color: "RED", description: `${logo} Spotify has rejected the request :pensive: skipping to the next song...` }] })
                return this.play(this.songs[0]);
            };
        };
        if (this.karaoke.isEnabled) {
            if (!this.client.deletedChannels.has(this.textChannel)) this.textChannel.send({ embeds: [{ description: `fetching lyrics... :mag_right:` }] });
            this.karaoke.instance = new ScrollingLyrics(song, this.karaoke.channel, this.karaoke.languageCode, this.textChannel, this.client.guildsStorage.get(this.guildId).prefix || this.client.config.prefix, this.client);
            const success = await this.karaoke.instance.init();
            if (!success) this.karaoke.instance = null;
            const body = eq.reset;
            if (this.player.node.ws) this.player.node.send({
                op: 'filters',
                guildId: this.guildId,
                ...body,
            });
            this.player.volume(this.volume);
        };
        this.nowPlaying = song;
        try {
            if (!this.repeat) this.songs.splice(0, 1);
            this.player.play(song.track, {
                volume: this.volume || 100,
                noReplace: noSkip
            });
            if (song.type === 'yt' || song.type === 'sc' || song.type === 'sp') {
                const fetched = await this.client.db.charts.findOne({
                    songID: song.info.uri,
                });
                if (fetched) {
                    fetched.timesPlayed += 1;
                    await fetched.save();
                } else {
                    const songDB = new this.client.db.charts({
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
            this.client.lavacordManager.leave(this.guild.id);
            if (!this.client.deletedChannels.has(this.textChannel)) return this.textChannel.send({ embeds: [{ description: `there was an error while playing the music! i had left the voice channel :pensive:` }] });
        };
    };
    startEvent = async(data) => this.start(data);
    endEvent = async(data) => this.end(data);
    pauseEvent = async(pause) => this.pauseFuc(pause);
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
            const embed = new MessageEmbed().setDescription(`${targetEmoji}Now playing **${embedURL(this.nowPlaying.info.title, this.nowPlaying.info.uri)}** by **${this.nowPlaying.info.author}** [${this.nowPlaying.requestedby}] ${this.nowPlaying.autoQueued ? '(auto-enqueued)': ''}`);

            if (this.karaoke.isEnabled && this.karaoke.instance) {
                if (this.karaoke.instance.success) embed.setFooter({text: this.karaoke.instance.success});
                if (this.karaoke.instance.pauseTimestamp) this.karaoke.instance.resume();
                else this.karaoke.instance.start();
            };
            if (!this.client.deletedChannels.has(this.textChannel)) {
                let sent;
                if (this.nowPlaying.loadingMessage && this.nowPlaying.loadingMessage.editable) {
                    sent = await this.nowPlaying.loadingMessage.edit({ embeds: [embed] });
                    this.nowPlaying.loadingMessage = undefined;
                    const { id } = sent; 
                    this.playingMessage = id;
                } else {
                    sent = await this.textChannel.send({ embeds: [embed] });
                    const { id } = sent; 
                    this.playingMessage = id;
                };
            };
        } catch (error) {
            logger.error(error);
        };
    };
    async end(data) {
        if (this.debug && !this.client.deletedChannels.has(this.textChannel)) this.textChannel.send({ embeds: [{ description: `[DEBUG]: recieved \`STOP\` event with type \`${data.reason}\`!` }] })
        if ((this.songs.length || this.autoPlay || this.repeat || this.loop) && this.playingMessage && !this.client.deletedChannels.has(this.textChannel) && (data.reason === "FINISHED" || data.reason === 'REPLACED')) {
            await this.textChannel.messages.delete(this.playingMessage)
            .catch(() => {
                logger.error(`Unable to delete playing message with ID: ${this.playingMessage}`);
            });
            this.playingMessage = null;
        };
        if (data.reason === 'REPLACED' || data.reason === "STOPPED") return;
        if (data.reason === "FINISHED" || data.reason === "LOAD_FAILED") {
            if (this.karaoke.isEnabled && this.karaoke.instance) this.karaoke.instance.stop();
            let upcoming;
            if (this.autoPlay && !this.songs.length && !this.repeat && !this.loop && !this.client.deletedChannels.has(this.textChannel) && this.nowPlaying.info.sourceName === 'youtube') {
                const annoying = this.client.customEmojis.get('annoyedgirl') ? this.client.customEmojis.get('annoyedgirl') : '😐';
                const cute = this.client.customEmojis.get('cutelove') ? this.client.customEmojis.get('cutelove') : '';
                const embed = new MessageEmbed().setColor('#4A91E2').setDescription(`the queue is empty! finding a good song for you to play... ${cute}`);
                const sent = await this.textChannel.send({ embeds: [embed] });
                const url = this.nowPlaying.type === 'yt' ? this.nowPlaying.info.uri : this.nowPlaying.info.originalUrl;

                const video = await fetchRelated(this.client, url);
                if (!video) {
                    if (sent.editable) sent.edit({ embeds: [{ color: "RED", description: `:x: there was no related song found for the last song in queue! autoplay is now disabled ${annoying}` }] });
                    else this.textChannel.send({ embeds: [{ color: "RED", description: `:x: there was no related song found for the last song in queue! autoplay is now disabled ${annoying}` }] });
                    upcoming = null;
                } else {
                    video.type = 'yt';
                    video.requestedby = this.nowPlaying.requestedby;
                    video.autoQueued = true;
                    video.loadingMessage = sent;
                    upcoming = video;
                }
            } else if (this.loop && data.reason !== 'LOAD_FAILED') {
                this.songs.push(this.nowPlaying);
                upcoming = this.songs[0];
            } else if (this.repeat && data.reason !== 'LOAD_FAILED') {
                upcoming = !this.nowPlaying ? this.songs[0] : this.nowPlaying;
            } else {
                upcoming = this.songs[0];
            };
            this.play(upcoming);
            if (data.reason === 'LOAD_FAILED' && !this.client.deletedChannels.has(this.textChannel)) this.textChannel.send({ embeds: [{ color: "RED", description: `sorry, i can't seem to be able to load that song! skipping to the next one for you now...` }] });
        };
    };
    async pauseFuc(pause) {
        if (pause) {
            if (this.karaoke.isEnabled && this.karaoke.instance) this.karaoke.instance.pause(Date.now());
        } else {
            if (this.karaoke.isEnabled && this.karaoke.instance) this.karaoke.instance.resume();
        }
    }
};
