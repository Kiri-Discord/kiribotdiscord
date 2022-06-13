const types = ["cute", "natural"]

exports.run = async(client, message, args) => {
    if (!args[0]) return message.reply({ embeds: [{ color: "#bee7f7", description: `you didn't include a response type :pensive: all the avaliable response are \`${types.join(', ')}\`` }] });
    const type = args[0].trim().toLowerCase();
    if (!types.includes(type)) return message.reply({ embeds: [{ color: "#bee7f7", description: `\`${args[0]}\` isn't a valid response mode :pensive: all the avaliable response are \`${types.join(', ')}\`` }] })

    await client.utils.sendEvalRequest(`
    cluster.manager.passthrough.db.guilds.findOneAndUpdate({
        guildID: '${message.guild.id}',
    }, {
        responseType: '${type}'
    });
    `)
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ my message response type was changed to \`${args[0]}\` mode` }] });
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
    channelPerms: ["EMBED_LINKS"]
};
