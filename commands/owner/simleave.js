exports.run = async (client, message, args) => {
	if (!client.config.owners.includes(message.author.id)) return message.message.reply('only coco or bell can execute this command!');
    client.emit('guildMemberLeave', message.member);
}
exports.help = {
	name: "simleave",
	description: "Simulates a leave",
	usage: "simleave",
	example: "simleave"
};
  
exports.conf = {
	aliases: [],
	cooldown: 2
};