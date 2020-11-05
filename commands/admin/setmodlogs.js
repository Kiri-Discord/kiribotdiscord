const Guild = require('../../model/guild');
const mongoose = require('mongoose');

exports.run = async (client, message, args) => {
    if (!message.member.hasPermission('MANAGE_GUILD'))
    return message.channel.send('You do not have \`Manage Server\` permission to use this command 😔').then(m => m.delete({timeout: 5000}));

    const channel = await message.mentions.channels.first();

    if (!channel) return message.channel.send('I cannot find that channel. Please mention a channel within this guild 😔').then(m => m.delete({timeout: 5000}));


    await Guild.findOne({
        guildID: message.guild.id
    }, async (err, guild) => {
        if (err) console.error(err);
        if (!guild) {
            const newGuild = new Guild({
                _id: mongoose.Types.ObjectId(),
                guildID: message.guild.id,
                guildName: message.guild.name,
                prefix: client.config.prefix,
                logChannelID: channel.id
            });
            await newGuild.save()
            .then(result => console.log(result))
            .catch(err => console.error(err));

            return message.channel.send(`The mod logs channel has been set to ${channel}`);
        } else {
            guild.updateOne({
                logChannelID: channel.id
            })
            .catch(err => console.error(err));
            

            return message.channel.send(`The mod logs channel has been set to ${channel}!`);

        };
    });
}
        
exports.help = {
	name: "setmodlogs",
	description: "Set the logs channel where i will logs moderation action",
	usage: "setmodlogs",
	example: "setmodlogs"
};
  
exports.conf = {
	aliases: ["setmodlogs"],
	cooldown: 5
};
  
