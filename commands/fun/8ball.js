exports.run = async(client, message, args) => {
    let question = args.join(" ");
    if (!question) return message.channel.send('you must write something lol.')
    const responses = [
        "ye",
        "probably",
        "idk",
        "unprobably",
        "no",
        "heck no",
        "yes",
        "of course",
        "i do"
    ];
    const randomResponse = Math.floor(Math.random() * (responses.length - 1) + 1);
    message.channel.sendTyping();
    setTimeout(async() => {
        return message.channel.send(`${responses[randomResponse]}`);
    }, 10000);
}
exports.help = {
    name: "8ball",
    description: "your life depends on this one.",
    usage: ["8ball `<question>`"],
    example: ["8ball `do you love me?`"]
};

exports.conf = {
    aliases: ["8ball"],
    cooldown: 3,
    guildOnly: true,
};