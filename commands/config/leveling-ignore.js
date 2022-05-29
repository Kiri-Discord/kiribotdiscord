exports.run = async(client, message, args) => {
    if (message.flags[0] === "off") {
        await client.utils.sendEvalRequest(`
        cluster.manager.passthrough.db.guilds.findOneAndUpdate({
            guildID: '${message.author.id}',
        }, {
            ignoreLevelingsChannelID: null
        });
        `)
        
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ ignore levelings has been disabled` }] });
    };

    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) channel = message.channel;
    await client.utils.sendEvalRequest(`
    cluster.manager.passthrough.db.guilds.findOneAndUpdate({
        guildID: '${message.author.id}',
    }, {
        ignoreLevelingsChannelID: '${channel.id}'
    });
    `)
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