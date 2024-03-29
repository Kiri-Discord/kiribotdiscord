const { MessageEmbed } = require('discord.js');
const request = require("node-superfetch");

exports.run = async(client, message, args) => {
    try {
        const query = args.join(` `);
        if (!query) return message.channel.send("you should enter something so i can search 👀");
        const { body } = await request
            .get('https://www.googleapis.com/youtube/v3/search')
            .query({
                part: 'snippet',
                type: 'video',
                maxResults: 1,
                q: query,
                safeSearch: message.channel.nsfw ? 'none' : 'strict',
                key: client.config.youtubekey
            });
        if (!body.items.length) return message.channel.send('no results found for ' + query + ".");
        const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTimestamp(new Date())
            .setTitle(`${body.items[0].snippet.title} - ${body.items[0].snippet.channelTitle}`)
            .setDescription(body.items[0].snippet.description)
            .setAuthor({name: 'YouTube', iconURL: 'https://seeklogo.net/wp-content/uploads/2020/03/YouTube-icon-SVG-512x512.png'})
            .setURL(`https://www.youtube.com/watch?v=${body.items[0].id.videoId}`)
            .setThumbnail(body.items[0].snippet.thumbnails.default.url)
        message.channel.send({ embeds: [embed] }).catch(err => logger.log('error', err));
    } catch (err) {
        if (err.status === 404) return message.reply('i cant find any results for that video :(');
        logger.log('error', err);
        return message.channel.send(`sorry! i got an error while trying to get you a result. try again later :pensiveW:`);
    };
};

exports.help = {
    name: "youtube",
    description: "search for a YouTube video from a query given",
    usage: ["youtube `<query>`"],
    example: ["youtube `what is the meaning of life?`"]
};

exports.conf = {
    aliases: ["yt"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}