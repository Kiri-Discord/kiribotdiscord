exports.run = async (client, message, args) => {
    
}








exports.help = {
    name: "greyscale",
    description: "is that blue? no, black.",
    usage: ["greyscale `[image attachment]`", "greyscale `[URL]`"],
    example: ["greyscale `image attachment`", "greyscale `https://example.com/girl.jpg`", "greyscale"]
};

exports.conf = {
    aliases: ["grayscale"],
    cooldown: 5,
    guildOnly: true,  
	channelPerms: ["ATTACH_FILES"]
}
