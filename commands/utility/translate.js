const { MessageEmbed } = require('discord.js');
const translate = require('@vitalets/google-translate-api');
const language = require('../../assets/language.json');
const { shorten } = require('../../util/util');

exports.run = async(client, message, args, prefix, cmd) => {
    const query = args.join(' ');
    const deadEmoji = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':pensive:'
    if (!query) return message.channel.send(`what would you want to translate? ${deadEmoji}`);
    if (query.length > 1900) return message.reply("sorry, your text can't be longer than 1900 character :pensive:");
    try {
        const res = await translate(query, { to: 'en', from: 'auto' });
        const embed = new MessageEmbed()
            .setColor('#4A91E2')
            .setDescription(shorten(res.text, 4095))
            .setFooter(`From "${res.from.text.autoCorrected || res.from.text.didYouMean ? shorten(res.from.text.value, 1980) : query}" (${language[res.from.language.iso]})`)
        return message.channel.send({ embeds: [embed] });
    } catch (err) {
        return message.reply(`sorry, the server is overloaded! please try again later :pensive:`);
    };
};


exports.help = {
    name: "translate",
    description: "translate a defined text to English",
    usage: ["translate \`<text>\`"],
    example: ["translate \`bonjour\`"]
};

exports.conf = {
    aliases: ["tl"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};