exports.run = async(client, message, args, prefix) => {
    const db = client.guildsStorage.get(message.guild.id);
    if (message.flags[0] === "off") {
        db.verifyChannelID = undefined;
        db.verifyRole = undefined;
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            verifyChannelID: null,
            verifyRole: null
        })
        return message.channel.send({ embed: { color: "f3f3f3", description: `❌ verify feature has been disabled for all upcoming new members` } });
    };
    if (!args.length) return message.channel.send({ embed: { color: "RED", description: `to setup the verify feature, do \`${prefix}setverify <#channel> <@role>\` or \`${prefix}setverify -off\` to disable it ;)` } })
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply({ embed: { color: "f3f3f3", description: 'i can\'t find that channel. pls mention a channel within this guild 😔' } });
    if (!channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return message.reply({ embed: { color: "f3f3f3", description: "i don't have the perms to send messages to that channel! :pensive:" } });

    const roleName = args.slice(1).join(' ');
    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));

    if (!role) return message.channel.send({ embed: { color: "RED", description: `no valid role was provided :pensive: i can only accept role mention, role name and role ID` } })

    if (role.name === "@everyone") return message.channel.send({ embed: { color: "RED", description: `\`@everyone\` is not a valid role!` } });
    if (role.name === "@here") return message.channel.send({ embed: { color: "RED", description: `\`@here\` is not a valid role!` } });

    if (!message.member.permissions.has('ADMINISTRATOR') && message.member.roles.highest.position <= role.position) return message.channel.send({ embed: { color: "RED", description: `that role is higher or equal your highest role!` } });

    if (message.guild.me.roles.highest.position <= role.position) return message.reply({ embed: { color: "RED", description: `that role is higher or equal my highest role!` } });

    db.verifyChannelID = channel.id;
    db.verifyRole = role.id;
    await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            verifyChannelID: channel.id,
            verifyRole: role.id
        })
        .catch(err => console.error(err));
    return message.channel.send({ embed: { color: "f3f3f3", description: `☑️ the verification guiding channel has been set to ${channel} and user will be given the verify role \`${role.name}\` after verifying!\nunverified people will be kicked in \`10 minutes\` by default. use \`${prefix}setverifytimeout <time>\` to set your own duration!` } });

}

exports.help = {
    name: "set-verify",
    description: "setup my verification system",
    usage: ["set-verify `<#channel | id> <role name | id>`", "set-verify `[-off]`"],
    example: ["set-verify `#verify @Verify`", "set-verify `55879822272712 575475475474577`"]
};

exports.conf = {
    aliases: ["verify", "setverify"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"],
    clientPerms: ["MANAGE_ROLES"]
};