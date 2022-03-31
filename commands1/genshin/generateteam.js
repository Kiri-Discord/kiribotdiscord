const { MessageEmbed } = require("discord.js");

exports.run = async (client, message, args, prefix) => {
    const data = client.genshinData;
    const chars = shuffle(data.getReleasedCharacters().map(x => x.name));

    const embed = new MessageEmbed()
    .setTitle('Random teams')
    .setColor('#93C4D1')
    .setThumbnail('https://i.imgur.com/L5EH00K.png')
    .setDescription(`
    **Team 1**: ${chars.slice(0, 4).map(x => data.emoji(x, true)).join(", ")}
    **Team 2**: ${chars.slice(4, 8).map(x => data.emoji(x, true)).join(", ")}
    `)
    .addField(`Replacement characters in case you're missing any:`, chars.slice(8, 14).map(x => data.emoji(x, true)).join(", "))

    return message.channel.send({embeds: [embed]});

    function shuffle(input) {
        for (let i = input.length; i > 0; i--) {
            const rand = Math.floor(Math.random() * i)

            const tmp = input[i - 1]
            input[i - 1] = input[rand]
            input[rand] = tmp
        }

        return input
    }
}

exports.help = {
    name: "generateteam",
    description:
        "generate a random team (Genshin Impact)",
    usage: ["generateteam"],
    example: ["generateteam"],
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};
