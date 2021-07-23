const YouTubeAPI = require("simple-youtube-api");
const { YOUTUBE_API_KEY } = require("../../util/musicutil");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const scdl = require("soundcloud-downloader").default
const { MessageMenuOption, MessageMenu } = require("discord-buttons");
const { MessageEmbed } = require('discord.js');
const { shortenText } = require('../../util/util');

exports.run = async(client, message, args, prefix, cmd, internal) => {
    if (!args.length) return message.channel.send({ embed: { color: "f3f3f3", description: `you must to provide me a song to search for! use \`${prefix}help search\` to learn more :wink:` } }).catch(console.error);
    if (!message.member.voice.channel) return message.channel.send({ embed: { color: "f3f3f3", description: `⚠️ you are not in a voice channel!` } });

    const search = args.join(" ");
    let result = [];
    let options = [];
    const loadingMessage = await message.channel.send({ embed: { description: `:mag_right: searching for \`${search}\`` } })
    try {
        message.channel.startTyping(true);
        const ytRes = await youtube.searchVideos(search, 10);
        const scRes = await scdl.search({
            query: search,
            resourceType: 'tracks'
        });
        if (!(ytRes.length + scRes.total_results) > 0) return message.inlineReply(`i am so sorry but there isn\'t any result for \`${search}\` :pensive:\ncan you check if there is typo?`)
        ytRes
            .filter((video) => video.type === 'video')
            .map((video) => {
                result.push({
                    type: 'yt',
                    title: shortenText(video.title, 22),
                    url: video.url,
                    desc: shortenText(video.raw.snippet.channelTitle, 22)
                });
            });
        scRes.collection
            .filter(x => x.streamable)
            .splice(0, scRes.collection.length > 10 ? 9 : scRes.collection.length)
            .map((track) => {
                result.push({
                    type: 'sc',
                    title: shortenText(track.title, 22),
                    url: track.permalink_url,
                    desc: shortenText(track.user.username, 22)
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
        await message.channel.stopTyping(true);
        let resultsMessage = await message.channel.send(embed, menu);
        let executed = false;
        setTimeout(async() => {
            if (!executed) {
                await loadingMessage.edit('this command is now inactive :pensive:')
                return resultsMessage.delete();
            }
        }, 30000);

        client.on("clickMenu", async(menu) => {
            if (menu.message.id == resultsMessage.id) {
                if (menu.clicker.user.id == message.author.id) {
                    executed = true;
                    await menu.message.delete();
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
        await message.channel.stopTyping(true);
        console.error(error);
        return message.inlineReply('there was an error while processing your search, sorry :pensive:').catch(console.error);
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