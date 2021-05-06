exports.run = async (client, message, args) => {
	const member = message.guild.members.cache.get(args[0]) || message.member;
    client.emit('guildMemberRemove', member);
}
exports.help = {
	name: "simleave",
	description: "Simulates a leave",
	usage: "simleave",
	example: "simleave"
};
  
exports.conf = {
	aliases: [],
	cooldown: 2,
	guildOnly: true,
	owner: true
};