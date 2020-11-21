exports.run = async (client, message, args) => {
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.reply('you don\'t have the \`MANAGE_GUILD\` permission to use this command 😔').then(m => m.delete({timeout: 5000}));

    const channel = await message.mentions.channels.first();

    if (!channel) return message.reply('i can\'t find that channel. pls mention a channel within this guild 😔').then(m => m.delete({timeout: 5000}));



    await client.dbguilds.findOneAndUpdate({
        guildID: message.guild.id,
    },
    {
        verifyChannelID: channel.id
    })
    .catch(err => console.error(err));
    message.channel.send(`the verify channel has been set to ${channel}!`);

}
        
exports.help = {
	name: "setverify",
	description: "Set the verify channel where i *verify* people",
	usage: "setverify <channel mention>",
	example: "setverify #logs"
};
  
exports.conf = {
	aliases: ["svr"],
	cooldown: 5
};
  
