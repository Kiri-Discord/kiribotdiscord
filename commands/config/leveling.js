exports.run = async (client, message, args, prefix) => {
    
    if (args[0] === "on") {
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        },
        {
            enableLevelings: true
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `☑️ **levelings has been enabled**`}});
    } else if (args[0] === "off") {
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        },
        {
            enableLevelings: false
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ **levelings has been disabled**`}});
    } else {
        return message.channel.send(`wrong usage :( use \`${prefix}help leveling\` to learn more!`)
    }
}

exports.help = {
	name: "leveling",
	description: "toggle message leveling for your server",
	usage: "leveling \`<toggle>\`",
	example: ["leveling \`on\`", "levelingignore \`off\`"]
};
  
exports.conf = {
	aliases: ["toggle-leveling", "toggleleveling"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};