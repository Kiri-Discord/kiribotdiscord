exports.run = async (client, message, args, prefix) => {
    if (message.flags[0] === "off") {
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        },
        {
            verifyChannelID: undefined,
            verifyRole: undefined
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ verify has been disabled`}});
    };
    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.inlineReply('i can\'t find that channel. pls mention a channel within this guild 😔');
    const roleName = args.slice(1).join(' ');
    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));

    if (!role) return message.inlineReply(`p l e a s e provide a vaild role name, mention or id for me to add pls ${sedEmoji}`)

    if (role.name === "@everyone") return message.inlineReply(`\`@everyone\` is a default role ${sedEmoji}`);
    if (role.name === "@here") return message.inlineReply(`\`@here\` is not a role ${sedEmoji}`);

    if (message.member.roles.highest.comparePositionTo(role) < 0) return message.inlineReply('that role is higher than your highest role! :pensive:');
    if (message.guild.me.roles.highest.comparePositionTo(role) < 0) return message.inlineReply('that role is higher than me :pensive:');

    

    await client.dbguilds.findOneAndUpdate({
        guildID: message.guild.id,
    },
    {
        verifyChannelID: channel.id,
        verifyRole: role.id
    })
    .catch(err => console.error(err));
    return message.channel.send({embed: {color: "f3f3f3", description: `☑️ the verification guiding channel has been set to ${channel} and user will be given the verify role \`${role.name}\`after verifying!\nunverified people will be kicked in \`10 minutes\` by default. use \`${prefix}setverifytimeout <time>\` to set your own duration!`}});

}
        
exports.help = {
	name: "setverify",
	description: "setup my verification system",
	usage: ["setverify `<#channel | id> <role name | id>`", "setverify `[-off]`"],
	example: ["setverify `#verify @Verify`", "setverify `55879822272712 575475475474577`"]
};

exports.conf = {
	aliases: ["verify"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_ROLES"]
};
