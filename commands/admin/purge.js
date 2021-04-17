const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    const guildDB = await client.dbguilds.findOne({
        guildID: message.guild.id
    });

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);
    const amount = parseInt(args[0]) + 1;
    if (isNaN(amount)) {
        return message.inlineReply('that doesn\'t seem to be a valid number.');
    } else if (amount <= 1 || amount > 100) {
        return message.inlineReply('you need to input a number between 1 and 99!');
    }

    const logembed = new MessageEmbed()
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setDescription(`${amount} messages deleted in ${message.channel}`)
    .addField('Moderator', message.author.tag)
    .addField('User ID', message.author.id);
    try {
        await message.channel.bulkDelete(amount, true);
        if (!logChannel) {
            return
        } else {
            return logChannel.send(logembed);
        };
    } catch (error) {
        return message.channel.send('there was an error when i tried to prune messages in this channel! can you check my perms?');
    };
},


exports.help = {
	name: "purge",
	description: "Purge a defined amount of message(s)",
	usage: "purge <number>",
	example: "purge 69"
};
  
exports.conf = {
	aliases: [],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_MESSAGES"],
    clientPerms: ["MANAGE_MESSAGES", "SEND_MESSAGES", "EMBED_LINKS"]
};
