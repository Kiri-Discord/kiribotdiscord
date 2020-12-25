exports.run = async (client, message, args) => {

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
	usage: ["setmodlogs `<#channel>`", "setmodlogs `<channel id>`"],
	example: ["setmodlogs `#logs`", "setmodlogs `4545455454644`"]
};
  
exports.conf = {
	aliases: ["sml"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
  
