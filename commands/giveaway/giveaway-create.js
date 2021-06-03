



exports.help = {
	name: "giveaway-create",
	description: "create a new giveaway on the server with interactive setup",
	usage: "giveaway-create",
	example: "giveaway-create"
};
  
exports.conf = {
	aliases: ["gcreate", "g-create"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};