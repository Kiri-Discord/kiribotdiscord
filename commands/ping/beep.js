
exports.run = async (client, message, args) => {
	message.channel.send('boop.');
	
};



exports.help = {
  name: "beep",
  description: "very self-explanatory",
  usage: `${prefix}beep`,
  example: `${prefix}beep`
}

exports.conf = {
  cooldown: 2
}
