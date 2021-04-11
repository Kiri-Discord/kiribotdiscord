exports.run = async (client, message, args) => {
	if (!client.config.owners.includes(message.author.id)) return message.inlineReply('only coco or bell can execute this command!');
	const member = message.guild.members.cache.get(args[0]) || message.member;
    client.emit('guildMemberAdd', member);
}
exports.help = {
	name: "simjoin",
	description: "Simulates a join",
	usage: "simjoin",
	example: "simjoin"
};
  
exports.conf = {
	aliases: [],
	cooldown: 2,
	guildOnly: true,
	userPerms: [],
	clientPerms: []
};
  
