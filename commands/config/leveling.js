exports.run = async(client, message, args, prefix) => {

    if (args[0] === "on") {
        const db = client.guildsStorage.get(message.guild.id);
        db.enableLevelings = true;
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            enableLevelings: true
        });
        message.channel.send({ embed: { color: "f3f3f3", description: `☑️ levelings has been enabled` } });
    } else if (args[0] === "off") {
        const db = client.guildsStorage.get(message.guild.id);
        db.enableLevelings = false;
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            enableLevelings: false
        })
        message.channel.send({ embed: { color: "f3f3f3", description: `❌ levelings has been disabled` } });
    } else {
        return message.channel.send({ embed: { color: "f3f3f3", description: `ℹ️ levelings is currently ${db.enableLevelings ? 'enabled' : 'disabled'} for our server. to change it, do \`${prefix}levelings <on/off>\`` } })
    }
}

exports.help = {
    name: "leveling",
    description: "toggle message leveling for your server",
    usage: "leveling \`<toggle>\`",
    example: ["leveling \`on\`", "leveling \`off\`"]
};

exports.conf = {
    aliases: ["levelings", "toggleleveling"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};
