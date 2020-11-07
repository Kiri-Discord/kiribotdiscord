const Guild = require('../../model/guild');
const mongoose = require('mongoose');

exports.run = async (client, message, args) => {
    if (!message.member.hasPermission('MANAGE_GUILD'))
    return message.channel.send('You do not have \`Manage Server\` permission to use this command 😔').then(m => m.delete({timeout: 5000}));

    const channel = await message.mentions.channels.first();

    if (!channel) return message.channel.send('I cannot find that channel. Please mention a channel within this guild 😔').then(m => m.delete({timeout: 5000}));



    await Guild.findOneAndUpdate({
        guildID: message.guild.id,
    },
    {
        logChannelID: channel.id
    })
    .catch(err => console.error(err));
    message.channel.send(`The mod logs channel has been set to ${channel}!`);

}
        
exports.help = {
	name: "setmodlogs",
	description: "Set the logs channel where i will logs moderation action",
	usage: "setmodlogs <channel mention>",
	example: "setmodlogs #logs"
};
  
exports.conf = {
	aliases: ["setmodlogs", "sml"],
	cooldown: 5
};
  
