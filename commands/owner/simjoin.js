exports.run = async (client, message, args) => {
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
	owner: true
};
  
