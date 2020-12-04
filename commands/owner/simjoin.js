exports.run = async (client, message, args) => {
    if (!client.config.owners.includes(message.author.id)) return message.reply('only coco or bell can execute this command!');
    client.emit('guildMemberAdd', message.member);
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
	guildOnly: true
};
  
