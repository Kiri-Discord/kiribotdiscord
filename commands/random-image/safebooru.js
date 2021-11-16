//credit to my friend Crocodile#6300 for this command

const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    const query = args.join(' ') || '';
    try {
        message.channel.sendTyping();
        const { text } = await request
            .get('https://safebooru.org/index.php')
            .query({
                page: 'dapi',
                s: 'post',
                q: 'index',
                json: 1,
                tags: query,
                limit: 200
            });
        const body = JSON.parse(text);
        const data = body[Math.floor(Math.random() * body.length)];
        const embed = new MessageEmbed()
            .setColor("#7DBBEB")
            .setAuthor(`${data.id} (${data.owner})`)
            .setImage(`https://safebooru.org/images/${data.directory}/${data.image}`);
        return message.channel.send({ embeds: [embed] })
    } catch (error) {
        message.channel.send("i can't fetch a post for you at this time! here is a hug for now 🤗");
        return logger.log('error', err);
    };
};


exports.help = {
    name: "safebooru",
    description: "finds a random picture on [Safebooru](https://safebooru.org/) with or without your query :)",
    usage: ["safebooru `[query]`"],
    example: ["safebooru `hug`"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};