exports.run = async(client, message, args, prefix) => {

    if (args.length < 1) {
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `ℹ️ my current guild prefix here is \`${prefix}\` you could use \`${prefix}setprefix <prefix>\` to change it :D` }] });
    };
    if (args.length < 2 || args.length > 8) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you can't choose a prefix that is larger than 8 or smaller than 3 characters :(` }] });
    await client.dbFuncs.changePrefix(message.guild.id, args[0]);
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ my current guild prefix here has been updated to \`${args[0]}\`` }] });
};


exports.help = {
    name: "set-prefix",
    description: "change my prefix throughout the server",
    usage: ["set-prefix `<prefix>`"],
    example: ["set-prefix `k!`"]
}

exports.conf = {
    aliases: ["change-prefix", "setprefix"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
}