exports.run = async(client, message, args) => {
    const res = client.leveling.getLevelBounds(args[0])
    return message.channel.send(`${res.lowerBound}, ${res.upperBound}`)
};

exports.help = {
    name: "getxp",
    description: "very self-explanatory",
    usage: [`getxp`],
    example: [`getxp`]
}

exports.conf = {
    aliases: [],
    cooldown: 2,
    owner: true
}