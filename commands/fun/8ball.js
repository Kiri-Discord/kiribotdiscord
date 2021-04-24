exports.run = async (client, message, args) => {
    let question = args.join(" ");
    if (!question) return message.channel.send('you must write something lmao.')
    const responses = [
        "ye",
        "probably",
        "idk",
        "unprobably",
        "no",
        "heck no",
        ]
    const randomResponse = Math.floor(Math.random() * (responses.length - 1) + 1);
    await message.channel.startTyping()
    setTimeout(async () => {
        await message.channel.stopTyping();
        return message.channel.send(`${responses[randomResponse]}`);
    }, 10000);
}
exports.help = {
	name: "8ball",
	description: "Your life depends on this one.",
	usage: "8ball `<question>`",
	example: "8ball `do you love me?`"
};
  
exports.conf = {
	aliases: ["8ball"],
    cooldown: 3,
    guildOnly: true,
};