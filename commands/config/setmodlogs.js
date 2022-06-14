exports.run = async(client, message, args, prefix) => {
    const db = client.guildsStorage.get(message.guild.id);
    if (message.flags[0] === "off") {
        await client.dbFuncs.changeModLog(message.guild.id, null);
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ mod logs has been disabled` }] });
    };
    if (!args.length) return message.channel.send({ embeds: [{ color: "RED", description: `to setup the logs channel, do \`${prefix}setmodlogs <#channel>\` or \`${prefix}setmodlogs -off\` to disable it ;)` }] })
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    if (!channel) return message.reply({ embeds: [{ color: "#bee7f7", description: 'i can\'t find that channel. please mention a channel within this guild 😔' }] });
    if (!channel.viewable || !channel.permissionsFor(message.guild.me).has('MANAGE_WEBHOOKS')) return message.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send logs to ${channel}!\nplease allow the permission \`MANAGE_WEBHOOKS\` for me before trying again.` }] });
    await client.dbFuncs.changeModLog(message.guild.id, channel.id);
    return message.channel.send(({ embeds: [{ color: "#bee7f7", description: `☑️ the mod logs channel has been set to ${channel}!` }] }));
}

exports.help = {
    name: "setmodlogs",
    description: "set the logs channel where i will logs moderation action",
    usage: ["setmodlogs `<#channel>`", "setmodlogs `<channel id>`", "setmodlogs -off"],
    example: ["setmodlogs `#logs`", "setmodlogs `4545455454644`", "setmodlogs -off"]
};

exports.conf = {
    aliases: ["sml"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"],
};