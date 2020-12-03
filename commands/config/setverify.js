exports.run = async (client, message, args) => {
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.reply('you don\'t have the \`MANAGE_GUILD\` permission to use this command 😔').then(m => m.delete({timeout: 5000}));

    if (message.flags[0] === "off") {
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        },
        {
            verifyChannelID: null,
            verifyRole: null
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ verify has been disabled`}});
    }

    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply('i can\'t find that channel. pls mention a channel within this guild 😔').then(m => m.delete({timeout: 5000}));
    const roleName = message.guild.roles.cache.find(r => (r.name === args[1].toString()) || (r.id === args[1].toString().replace(/[^\w\s]/gi, '')));
    if (!roleName) return message.reply('p l e a s e provide a vaild role name, mention or id for me to add pls').then(m => m.delete({ timeout: 5000 }));

    if (roleName.name === "@everyone") return message.reply('p l e a s e provide a vaild role name, mention or id for me to add pls').then(m => m.delete({ timeout: 5000 }));
    if (roleName.name === "@here") return message.reply('p l e a s e provide a vaild role name, mention or id for me to add pls').then(m => m.delete({ timeout: 5000 }));
    



    await client.dbguilds.findOneAndUpdate({
        guildID: message.guild.id,
    },
    {
        verifyChannelID: channel.id,
        verifyRole: roleName.id
    })
    .catch(err => console.error(err));
    return message.channel.send({embed: {color: "f3f3f3", description: `☑️ the verify channel has been set to ${channel}! with the verify role \`${roleName.name}\``}});

}
        
exports.help = {
	name: "setverify",
	description: "Set the verify channel where i *verify* people",
	usage: "setverify <#channel | id> <role name || id> [-off]",
	example: "setverify #verify @Verify"
};
  
exports.conf = {
	aliases: ["verify"],
	cooldown: 5
};
  
