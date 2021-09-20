const types = ["cute", "natural"]

exports.run = async(client, message, args) => {
    const type = args[0].toLowerCase();
    if (!types.includes(type)) return message.reply({ embeds: [{ color: "f3f3f3", description: `\`${args[0]}\` isn't a valid response mode :pensive: all the avaliable response are \`${types.join(', ')}\`` }] })
    const db = client.guildsStorage.get(message.guild.id);
    db.responseType = args[0];
    await client.dbguilds.findOneAndUpdate({
        guildID: message.guild.id,
    }, {
        responseType: type
    });
    return message.channel.send({ embeds: [{ color: "f3f3f3", description: `☑️ my message response type was changed to \`${args[0]}\` mode` }] });
}

exports.help = {
    name: "response",
    description: "change my response messages style (avaliable in join/leave message)",
    usage: ["response `<mode>`"],
    example: ["response `natural`"]
};

exports.conf = {
    aliases: ["style"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS", "MANAGE_MESSAGES"]
};