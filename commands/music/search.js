const scdl = require("soundcloud-downloader").default;
// const { MessageMenuOption, MessageMenu } = require("discord-buttons");
const { MessageEmbed } = require('discord.js');
const { shortenText } = require('../../util/util');
const { fetchInfo } = require('../../features/music/play');
const moment = require('moment');
require('moment-duration-format');

exports.run = async(client, message, args, prefix, cmd, internal) => {
        if (!args.length) return message.channel.send({ embed: { color: "f3f3f3", description: `you must to provide me a song to search for with \`${prefix}search <title>\`` } });
        if (!message.member.voice.channel) return message.channel.send({ embed: { color: "f3f3f3", description: `⚠️ you are not in a voice channel!` } });

        const search = args.join(" ");
        let result = [];
        let options = [];
        try {
            const loadingMessage = await message.channel.send({ embed: { description: `looking for \`${search}\`` } });
            const ytRes = await fetchInfo(client, search, true);
            const scRes = await scdl.search({
                query: search,
                resourceType: 'tracks'
            });
            if (!(ytRes.length + scRes.total_results) > 0) return message.channel.send({ embed: { color: "RED", description: `:x: no match were found` } })
            ytRes
                .splice(0, 10)
                .map((video) => {
                        result.push({
                                    type: 'yt',
                                    title: shortenText(video.info.title, 80),
                                    url: video.info.uri,
                                    desc: `${shortenText(video.info.author, 12)} ${video.info.isStream ? '' : ` | ${shortenText(moment.duration(video.info.length).format('H[h] m[m] s[s]'))}`}`
                });
            });
        scRes.collection
            .filter(x => x.streamable)
            .splice(0, scRes.collection.length > 10 ? 9 : scRes.collection.length)
            .map((track) => {
                result.push({
                    type: 'sc',
                    title: shortenText(track.title, 80),
                    url: track.permalink_url,
                    desc: `${shortenText(track.user.username, 12)} | ${shortenText(moment.duration(track.duration).format('H[h] m[m] s[s]'))}`
                })
            })
        result.map((song, index) => {
            options.push(new MessageMenuOption()
                .setLabel(song.title)
                .setValue(index)
                .setDescription(song.desc)
                .setDefault()
                .setEmoji(song.type === 'yt' ? client.customEmojis.get('youtube').id : client.customEmojis.get('soundcloud').id, false))
        })
        const menu = new MessageMenu()
            .setID("search")
            .setMaxValues(options.length)
            .setMinValues(1)
            .addOptions(options)
            .setPlaceholder('choose a song <3')
        const embed = new MessageEmbed()
            .setDescription('choose the song that you want to add in:')
            .setFooter('deleting this in 30 seconds')
        ;
        let resultsMessage = await message.channel.send(embed, menu);
        let executed = false;
        setTimeout(async() => {
            if (!executed) {
                await loadingMessage.edit({ embed: { description: `this command is now inactive :pensive:` } })
                return resultsMessage.delete();
            }
        }, 30000);

        client.on("clickMenu", async(menu) => {
            if (menu.message.id == resultsMessage.id) {
                if (menu.clicker.user.id == message.author.id) {
                    executed = true;
                    await menu.message.delete();
                    await loadingMessage.edit({ embed: { description: `this command is now inactive :pensive:` } })
                    for (let song of menu.values) {
                        const url = result[song].url;
                        await client.commands
                            .get("play")
                            .run(client, message, [url], prefix, cmd, internal);
                    };
                } else {
                    menu.reply.send(":x: you are not the one who executed the command :(", true)
                }
            }
        })
    } catch (error) {
        ;
        logger.log('error', error);
        return message.reply('there was an error while processing your search, sorry :pensive:').catch(err => logger.log('error', err));
    }
};

exports.help = {
    name: "search",
    description: "search a songs to play from (avaliable for YouTube and SoundCloud)",
    usage: "search `<song name>`",
    example: "search `never gonna give you up`"
}

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    clientPerms: ["CONNECT", "SPEAK"],
}