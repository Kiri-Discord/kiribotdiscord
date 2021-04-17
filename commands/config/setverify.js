exports.run = async (client, message, args, prefix) => {
    if (message.flags[0] === "off") {
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        },
        {
            verifyChannelID: null,
            verifyRole: null
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ verify has been disabled`}});
    };
    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.inlineReply('i can\'t find that channel. pls mention a channel within this guild 😔');
    const roleName = args.slice(1).join(' ');
    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));
    if (!role) return message.inlineReply('p l e a s e provide a vaild role name, mention or id for me to add pls');

    if (role.name === "@everyone") return message.inlineReply('p l e a s e provide a vaild role name, mention or id for me to add pls');
    if (role.name === "@here") return message.inlineReply('p l e a s e provide a vaild role name, mention or id for me to add pls');
    

    await client.dbguilds.findOneAndUpdate({
        guildID: message.guild.id,
    },
    {
        verifyChannelID: channel.id,
        verifyRole: role.id
    })
    .catch(err => console.error(err));
    return message.channel.send({embed: {color: "f3f3f3", description: `☑️ the verify channel has been set to ${channel}! with the verify role \`${role.name}\`!\nunverified people will be kicked in **5 minutes** by default. use \`${prefix}setverifytimeout <time>\` to set your own duration!`}});

}
        
exports.help = {
	name: "setverify",
	description: "Set the verify channel where i *verify* people",
	usage: ["setverify `<#channel | id> <role name | id>`", "setverify `[-off]`"],
	example: ["setverify `#verify @Verify`", "setverify `55879822272712 575475475474577`"]
};

exports.conf = {
	aliases: ["verify"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
