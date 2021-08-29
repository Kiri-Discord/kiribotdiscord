const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    const db = client.guildsStorage.get(message.guild.id);
    if (message.flags[0] === "off") {
        db.byeChannelID = undefined;
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            byeChannelID: undefined
        });
        const embed = new MessageEmbed()
            .setColor("f3f3f3")
            .setDescription(`❌ goodbye feature has been disabled`);
        return message.channel.send(embed)
    };
    if (!args.length) return message.channel.send({ embed: { color: "RED", description: `to setup the goodbye channel, do \`${prefix}setgoodbye <#channel>\` or \`${prefix}setgoodbye -off\` to disable it ;)` } })
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    if (!channel) return message.inlineReply({ embed: { color: "f3f3f3", description: 'i can\'t find that channel. pls mention a channel within this guild 😔' } });
    if (!channel.permissionsFor(message.guild.me).has('MANAGE_WEBHOOKS')) return message.inlineReply({ embed: { color: "f3f3f3", description: "i don't have the perms to send goodbye message to that channel! :pensive:\nplease allow the permission \`MANAGE_WEBHOOKS\` **and** \`SEND_MESSAGES\` for me there before trying again." } });
    db.byeChannelID = channel.id;

    const storageAfter = await client.dbguilds.findOneAndUpdate({
        guildID: message.guild.id,
    }, {
        byeChannelID: channel.id
    })
    const embed = new MessageEmbed()
        .setColor("f3f3f3")
        .setDescription(`☑️ the greeting feature has been set to ${channel}!`)
        .setFooter(`the "${storageAfter.responseType}" response type has been set for all upcoming goodbye message`)
    return message.channel.send(embed);
}

exports.help = {
    name: "setgoodbye",
    description: "setup the goodbye feature for leaving members",
    usage: ["setgoodbye `<#channel>`", "setgoodbye `<channel id>`", "setgoodbye -off"],
    example: ["setgoodbye `#logs`", "setgoodbye `4545455454644`", "setgoodbye -off"]
};

exports.conf = {
    aliases: ["greetings", "welcome"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};