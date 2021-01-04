exports.help = {
  name: "invite",
  description: "more info about how to invite me.",
  usage: "invite",
  example: "invite"
}

exports.conf = {
  aliases: [],
  cooldown: 2,
  guildOnly: false,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES"]
}

exports.run = async (client, message, args) => {
	message.channel.send('not like other bot that have enough stamina to work everywhere, i can only work here :(\n*you can still request to invite me if you are already a partner of Sefiria!*\nhttps://i.ibb.co/1LhXvjL/private.gif');
};
