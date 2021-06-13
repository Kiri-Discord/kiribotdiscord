const { reactIfAble } = require('../../util/util');

exports.run = async (client, message, args, prefix, cmd) => {
    if (!args[0]) {
        const onChannel = client.giveaways.giveaways
        .filter(g => g.channelID === message.channel.id);
        if (!onChannel || !onChannel.length) return message.inlineReply(`:boom: there isn't any ongoing giveaway on this channel :pensive:\nuse \`${prefix} giveaway-list\` to get the remaining giveaways on this server, then run this command again with the message ID of that giveaway by \`${prefix}${cmd} <message ID>\` :grin:`)
        const matches = onChannel
        .sort((a, b) => b.startAt - a.startAt)
        .filter(g => g.extraData.hostedByID === message.author.id)
        if (!matches || !matches.length) return message.channel.send(`:boom: none of those giveaways on this channel was yours :pensive:\nuse \`${prefix} giveaway-list\` to get the remaining giveaways on this server, then run this command again with the message ID of that giveaway by \`${prefix}${cmd} <message ID>\` :grin:`)
        const firstGiveaway = onChannel[0];
        await client.giveaways.end(firstGiveaway.messageID);
        return reactIfAble(message, client.user, '✅');
    } else {
        const onServer = client.giveaways.giveaways.filter(g => g.guildID === message.guild.id);
        if (!onServer || !onServer.length) return message.inlineReply(`:boom: there isn't any ongoing giveaway on the server :pensive:`);
        const giveaway = onServer.find(g => g.messageID === args[0]);
        if (giveaway.extraData.hostedByID !== message.author.id && !message.member.hasPermission('ADMINISTRATOR')) return message.inlineReply('that isn\'t your giveaway, or you don\'t have the \`ADMINISTRATOR\` permission to take full control over that giveaway :pensive:');
        await client.giveaways.end(giveaway.messageID);
        return message.inlineReply(`the giveaway ${giveaway.prize} was ended :grin:`)
    }
};

exports.help = {
	name: "giveaway-end",
	description: "end a giveaway at the current channel or with a message ID (members with \`ADMINISTRATOR\` permission have full control over any ongoing giveaways)",
	usage: "giveaway-end \`[message ID]\`",
	example: ["giveaway-end \`09035985883024\`", "giveaway-end"]
};
  
exports.conf = {
	aliases: ["gend", "g-end"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS", 'MANAGE_MESSAGES'],
    userPerms: ["MANAGE_MESSAGES"]
}