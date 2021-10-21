const { reactIfAble } = require('../../util/util');
const { Permissions } = require('discord.js');

exports.run = async(client, message, args, prefix, cmd) => {
    if (!args[0]) {
        const onChannel = client.giveaways.giveaways
            .filter(g => g.channelId === message.channel.id);
        if (!onChannel || !onChannel.length) return message.reply({
            embeds: [{
                color: 'RED',
                description: `:boom: there isn't any ongoing giveaway on this channel :pensive:\nuse \`${prefix} giveaway-list\` to get the remaining giveaways on this server, then run this command again with the message ID of that giveaway by \`${prefix}${cmd} <message ID>\` :grin:`
            }]
        })
        const matches = onChannel.sort((a, b) => b.startAt - a.startAt);

        const firstGiveaway = matches[0];
        if (firstGiveaway.extraData.hostedByID !== message.author.id && !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply({
            embeds: [{
                description: 'that isn\'t your giveaway, or you don\'t have the \`ADMINISTRATOR\` permission to take full control over that giveaway :pensive:',
                color: 'RED'
            }]
        });
        await client.giveaways.end(firstGiveaway.messageId);
        return reactIfAble(message, client.user, '✅');
    } else {
        const onServer = client.giveaways.giveaways.filter(g => g.guildId === message.guild.id);
        if (!onServer || !onServer.length) return message.reply({
            embeds: [{
                description: `:boom: there isn't any ongoing giveaway on the server :pensive:`,
                color: 'RED'
            }]
        });
        const giveaway = onServer.find(g => g.messageId === args[0]);
        if (!giveaway) return message.reply({
            embeds: [{
                description: "there isn't any giveaway with that message ID :pensive:",
                color: 'RED'
            }]
        })
        if (giveaway.extraData.hostedByID !== message.author.id && !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply({
            embeds: [{
                description: 'that isn\'t your giveaway, or you don\'t have the \`ADMINISTRATOR\` permission to take full control over that giveaway :pensive:',
                color: 'RED'
            }]
        });
        await client.giveaways.end(giveaway.messageId);
        return message.reply({
            embeds: [{
                description: `the giveaway ${giveaway.prize} was ended :grin:`,
                color: 'RED'
            }]
        })
    }
};

exports.help = {
    name: "giveaway-end",
    description: "end a giveaway at the current channel or with a message ID (members with \`ADMINISTRATOR\` permission have full control over any ongoing giveaways)",
    usage: ["giveaway-end \`[message ID]\`"],
    example: ["giveaway-end \`09035985883024\`", "giveaway-end"]
};

exports.conf = {
    aliases: ["gend", "g-end"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
    userPerms: ["MANAGE_MESSAGES"]
}