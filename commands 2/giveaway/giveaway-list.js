const { MessageEmbed } = require('discord.js');
const { embedURL } = require('../../util/util');
const humanizeDuration = require("humanize-duration");

exports.run = async(client, message, args, prefix) => {
    const onServer = client.giveaways.giveaways
        .filter(g => g.guildId === message.guild.id);
    if (!onServer || !onServer.length) return message.channel.send(":boom: sorry, there isn't any existing giveaway for your server :pensive:");
    const all = onServer.sort((a, b) => b.startAt - a.startAt);
    let list = [];
    all.map((giveaway) => list.push(!giveaway.ended ?
        `${giveaway.hostedBy} • **${giveaway.prize}** | ends in: **${humanizeDuration(giveaway.endAt - new Date())}** | ${embedURL('Jump to giveaway', giveaway.messageURL)} (message ID: \`${giveaway.messageId})\`` :
        `**ENDED** ${giveaway.hostedBy} • **${giveaway.prize}** | ${embedURL('Jump to giveaway', giveaway.messageURL)} (message ID: \`${giveaway.messageId})\``));

    const embed = new MessageEmbed()
        .setDescription(list.join('\n'))
        .setAuthor(`giveaway list for ${message.guild.name}`, message.guild.iconURL({ size: 4096, dynamic: true }))
        .setTimestamp()
        .setFooter(`${onServer.filter(g => !g.ended).length} ongoing giveaway`)

    return message.channel.send({ embeds: [embed] });
};

exports.help = {
    name: "giveaway-list",
    description: "show a list of existing giveaways on your server",
    usage: "giveaway-list",
    example: "giveaway-list"
};

exports.conf = {
    aliases: ["glist", "g-list"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}