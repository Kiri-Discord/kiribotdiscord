const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args) => {
    const deadEmoji = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':pensive:';
    const query = args.join(' ');
    if (!query) return message.channel.send(`what word would you want me to find? ${deadEmoji}`);
    try {
        const { body } = await request
            .get('http://jisho.org/api/v1/search/words')
            .query({ keyword: query });
        if (!body.data.length) return message.channel.send("i couldn't find any result with that word :pensive:");
        const data = body.data[0];
        const embed = new MessageEmbed()
            .setColor('#4A91E2')
            .setDescription(`"${query}" means: ` + data.senses[0].english_definitions.join('\n'))
            .setFooter(`${data.japanese[0].word || data.japanese[0].reading}`);
        return message.channel.send({ embeds: [embed] });
    } catch (err) {
        console.error(err);
        return message.channel.send(`there was an error while getting that word's info. can you try again later? :pensive:`);
    };
};


exports.help = {
    name: "jisuo",
    description: "defines a Japanese word",
    usage: ["jisuo `<text>`"],
    example: ["jisuo `ohayo`"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};