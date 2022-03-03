exports.run = async(client, message, args) => {
    const db = client.guildsStorage.get(message.guild.id);
    if (message.flags[0] === "off") {
        db.ignoreLevelingsChannelID = undefined;
        await client.db.guilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            ignoreLevelingsChannelID: null
        });
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ ignore levelings has been disabled` }] });
    };

    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) channel = message.channel;
    db.ignoreLevelingsChannelID = channel.id;
    await client.db.guilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            ignoreLevelingsChannelID: channel.id
        })
        .catch(err => logger.log('error', err));
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ i will ignore levelings from ${channel} starting from now.` }] });
}

exports.help = {
    name: "leveling-ignore",
    description: "ignore levelings from a message channel",
    usage: ["leveling-ignore \`[#channel]\`", "leveling-ignore \`[channel id]\`"],
    example: ["leveling-ignore \`#spam\`", "leveling-ignore \`84487884448848\`"]
};

exports.conf = {
    aliases: ["ignorelevel", "iglevel", "levelingignore"],
    cooldown: 4,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};