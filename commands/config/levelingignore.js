exports.run = async (client, message, args) => {
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.reply('you don\'t have the \`MANAGE_GUILD\` permission to use this command 😔').then(m => m.delete({timeout: 5000}));

    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0])
    if (!channel) channel = message.channel;

    if (message.flags[0] === "off") {
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        },
        {
            ignoreLevelingsChannelID: null
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ ignore levelings has been disabled`}});
    }

    
    await client.dbguilds.findOneAndUpdate({
        guildID: message.guild.id,
    },
    {
        ignoreLevelingsChannelID: channel.id
    })
    .catch(err => console.error(err));
    return message.channel.send({embed: {color: "f3f3f3", description: `☑️ i will ignore levelings from ${channel} starting from now`}});


}

exports.help = {
	name: "levelingignore",
	description: "ignore levelings from a message channel",
	usage: "levelingignore [#channel | channel id]",
	example: "levelingignore #spam"
};
  
exports.conf = {
	aliases: ["ignorelevel", "iglevel"],
	cooldown: 5
};
