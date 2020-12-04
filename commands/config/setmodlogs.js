exports.run = async (client, message, args) => {
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.reply('you don\'t have the \`MANAGE_GUILD\` permission to use this command 😔').then(m => m.delete({timeout: 5000}));

    const channel = await message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    if (!channel) return message.reply('i can\'t find that channel. pls mention a channel within this guild 😔').then(m => m.delete({timeout: 5000}));

    if (message.flags[0] === "off") {
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        },
        {
            logChannelID: null
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ mod logs has been disabled`}});
    }

    await client.dbguilds.findOneAndUpdate({
        guildID: message.guild.id,
    },
    {
        logChannelID: channel.id
    })
    .catch(err => console.error(err));
    message.channel.send(({embed: {color: "f3f3f3", description: `☑️ the mod logs channel has been set to ${channel}!`}}));

}
        
exports.help = {
	name: "setmodlogs",
	description: "Set the logs channel where i will logs moderation action",
	usage: "setmodlogs <#channel | channel id>",
	example: "setmodlogs #logs"
};
  
exports.conf = {
	aliases: ["sml"],
    cooldown: 5,
    guildOnly: true
};
  
