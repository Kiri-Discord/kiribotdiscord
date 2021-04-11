const { MessageEmbed } = require("discord.js");
const YouTubeAPI = require("simple-youtube-api");
const { YOUTUBE_API_KEY } = require("../../util/musicutil");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);

exports.run = async (client, message, args) => {
    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    });
    if (!args.length) return message.inlineReply({embed: {color: "f3f3f3", description: `you must to provide me a song to search for! use \`${settiingprefix}help search\` to learn more :wink:`}}).catch(console.error);
    if (message.channel.activeCollector) return message.inlineReply({embed: {color: "f3f3f3", description: `⚠️ there is already a search existing in this channel. please finish that first :pensive:`}});
    if (!message.member.voice.channel) return message.inlineReply({embed: {color: "f3f3f3", description: `⚠️ you are not in a voice channel!`}});

    const search = args.join(" ");

    let resultsEmbed = new MessageEmbed()
    .setDescription('*pro tip: add more than a song from this search result to the queue by using commma :wink:*\n*for example*: \`1, 6 ,4\`')
    .setTitle(`Here is your search result for "${search}"`)
    .setColor("RANDOM")
    .setAuthor(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
    .setFooter('this search will timeout in 30 seconds')
    .setThumbnail(message.guild.iconURL({size: 4096, dynamic: true}))

    try {
        const results = await youtube.searchVideos(search, 10);
        results.map((video, index) => resultsEmbed.addField(video.shortURL, `\`${index + 1}\` **${video.title}**`));

        let resultsMessage = await message.channel.send(resultsEmbed);

        function filter(msg) {
        const pattern = /^[0-9]{1,2}(\s*,\s*[0-9]{1,2})*$/;
        return pattern.test(msg.content);
        }

        message.channel.activeCollector = true;
        const response = await message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ["time"] });
        response.on('collect', async msg => {
            
            if (msg.content.includes(",")) {
                await msg.delete().catch(console.error);
                let songs = msg.content.split(",").map((str) => str.trim());
        
                for (let song of songs) {
                    await client.commands
                    .get("play")
                    .run(client, message, [resultsEmbed.fields[parseInt(song) - 1].name]);
                }
            } else {
                await msg.delete().catch(console.error);
                const choice = resultsEmbed.fields[parseInt(msg.content) - 1].name;
                client.commands.get("play").run(client, message, [choice]);        
            }
        });

        response.on('end', msg => {
            message.channel.activeCollector = false;
            resultsMessage.delete().catch(console.error);
        });
    } catch (error) {
      console.error(error);
      message.channel.activeCollector = false;
      message.inlineReply('there was an error while processing your search, sorry :pensive:').catch(console.error);
    }
}





exports.help = {
  name: "search",
  description: "Search songs to play from YouTube (Soundcloud not available yet but you can still paste the link :pensive:)",
  usage: "search `<song name>`",
  example: "search `never gonna give you up`"
}

exports.conf = {
  aliases: ["sh"],
  cooldown: 4,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "CONNECT", "SPEAK"]
}