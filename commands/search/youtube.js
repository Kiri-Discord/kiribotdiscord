const { MessageEmbed } = require('discord.js');
const request = require("node-superfetch");


exports.run = async (client, message, args) => {
    try {
        const query = args.join(` `);
        if (!query) return message.channel.send("enter something so i can search 👀");
        const { body } = await request
          .get('https://www.googleapis.com/youtube/v3/search')
          .query({
            part: 'snippet',
            type: 'video',
            maxResults: 1,
            q: query,
            safeSearch: message.channel.nsfw ? 'none' : 'strict',
            key: process.env.youtubekey
          });
        if (!body.items.length) return message.channel.send('no results found for ' + query + ".");
        const embed = new MessageEmbed()
          .setColor("#ff0000")
          .setTimestamp(new Date())
          .setTitle(`${body.items[0].snippet.title} - ${body.items[0].snippet.channelTitle}`)
          .setDescription(body.items[0].snippet.description)
          .setAuthor('YouTube', 'https://seeklogo.net/wp-content/uploads/2020/03/YouTube-icon-SVG-512x512.png')
          .setURL(`https://www.youtube.com/watch?v=${body.items[0].id.videoId}`)
          .setThumbnail(body.items[0].snippet.thumbnails.default.url)
          .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
        message.channel.send(embed).catch(console.error);
      } catch (err) {
        if (err.status === 404) return message.inlineReply('i cant find any results for that video :(');
        console.log(err);
        return message.channel.send(`sorry :( i got an error while trying to get you a result. try again later!`);
    }
};


exports.help = {
    name: "youtube",
    description: "get you a youtube video.",
    usage: "youtube `<query>`",
    example: "youtube `rickroll`"
};

exports.conf = {
    aliases: ["yt"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}
