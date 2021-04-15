exports.run = async (client, message, args) => {
    
    if (message.flags[0] === "off") {
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        },
        {
            ignoreLevelingsChannelID: null
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ ignore levelings has been disabled`}});
    }
    
    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) channel = message.channel;
    
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
	usage: ["levelingignore \`[#channel]\`", "levelingignore \`[channel id]\`"],
	example: ["levelingignore \`#spam\`", "levelingignore \`84487884448848\`"]
};
  
exports.conf = {
	aliases: ["ignorelevel", "iglevel"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
