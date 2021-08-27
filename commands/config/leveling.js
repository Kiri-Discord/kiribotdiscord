exports.run = async(client, message, args, prefix) => {

    if (args[0] === "on") {
        message.channel.send({ embed: { color: "f3f3f3", description: `☑️ **levelings has been enabled**` } });
        const db = client.guildsStorage.get(message.guild.id);
        db.enableLevelings = true;
        client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            enableLevelings: true
        })
    } else if (args[0] === "off") {
        message.channel.send({ embed: { color: "f3f3f3", description: `❌ **levelings has been disabled**` } });
        const db = client.guildsStorage.get(message.guild.id);
        db.enableLevelings = true;
        client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            enableLevelings: false
        })
        message.channel.send({ embed: { color: "f3f3f3", description: `❌ **levelings has been disabled**` } });
    } else {
        return message.channel.send(`wrong usage :( use \`${prefix}help leveling\` to learn more!`)
    }
}

exports.help = {
    name: "leveling",
    description: "toggle message leveling for your server",
    usage: "leveling \`<toggle>\`",
    example: ["leveling \`on\`", "leveling \`off\`"]
};

exports.conf = {
    aliases: ["toggle-leveling", "toggleleveling"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};