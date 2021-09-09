exports.run = async(client, message, args, prefix) => {

    if (args.length < 1) {
        return message.channel.send({ embeds: [{ color: "f3f3f3", description: `ℹ️ my current guild prefix here is \`${prefix}\` you could use \`${prefix}setprefix <prefix>\` to change it :D` }] });
    };
    const db = client.guildsStorage.get(message.guild.id);
    db.prefix = args[0];

    await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            prefix: args[0]
        })
        .catch(err => console.error(err));


    return message.channel.send({ embed: [{ color: "f3f3f3", description: `☑️ my current guild prefix here has been updated to \`${args[0]}\`` }] });


};


exports.help = {
    name: "set-prefix",
    description: "change my prefix.. pretty self-explanatory.",
    usage: "set-prefix `<prefix>`",
    example: "set-prefix `s!`"
}

exports.conf = {
    aliases: ["change-prefix", "setprefix"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
}