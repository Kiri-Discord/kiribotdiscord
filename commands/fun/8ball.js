exports.run = async (client, message, args) => {
    let question = args.join(" ")


    if(!question) return message.channel.send('you must write something lmao.')

    const responses = [
        "ye",
        "probably",
        "idk",
        "unprobably",
        "no",
        "heck no",
        ]
    const randomResponse = Math.floor(Math.random() * (responses.length - 1) + 1);

    message.channel.startTyping()
    setTimeout(() => {       
        message.channel.send(`${responses[randomResponse]}`).then((message)=>{
            message.channel.stopTyping();
        });
    }, 10000);
    

}
exports.help = {
	name: "8ball",
	description: "Your life depends on this one.",
	usage: "8ball <question>",
	example: "8ball how to basic"
};
  
exports.conf = {
	aliases: ["8ball"],
    cooldown: 3,
    guildOnly: true
};