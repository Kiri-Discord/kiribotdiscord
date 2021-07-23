const { canModifyQueue } = require("../../util/musicutil");
const { reactIfAble } = require('../../util/util');
exports.run = async(client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.inlineReply('there is nothing to stop since there isn\'t anything in the queue :grimacing:');
    if (!canModifyQueue(message.member)) return message.inlineReply(`you are not in the voice channel where i\'m playing music! join ${queue.channel} first :wink:`);
    queue.connection.disconnect();
    return reactIfAble(message, client.user, '👋')
};


exports.help = {
    name: "disconnect",
    description: "disconnect from the current music voice channel that i am connecting to",
    usage: "disconnect",
    example: "disconnect"
};

exports.conf = {
    aliases: ["dc"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};