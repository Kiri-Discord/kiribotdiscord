const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

exports.run = async(client, message, args, prefix) => {
    const votes = await client.db.vote.find({
        userID: message.author.id
    });
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setStyle('LINK')
            .setURL('https://top.gg/bot/859116638820761630')
            .setLabel('vote for me on top.gg!')
        );
    const embed = new MessageEmbed()
        .setURL('https://top.gg/bot/859116638820761630')
        .setTitle('vote for Kiri!')
        .setThumbnail(client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .setDescription(votes.length ? `you have ${votes.length} votes that you haven't convert to rewards! (you can only claim one reward for each vote)` : 'you have not vote yet :pensive:\nthere are some rewards below to obtain if you vote!')
        .addField('vote rewards', `
        ⏣ **50% to 80%** bonus from your daily rewards \`${prefix}daily\`
        🎫 **1 Effect Ticket** \`${prefix}ticket\`
        `)
    return message.channel.send({ embeds: [embed], components: [row] });
};

exports.help = {
    name: "vote",
    description: "get the links to vote for me and exchange for cool rewards!",
    usage: ["vote"],
    example: ["vote"]
};

exports.conf = {
    channelPerms: ["EMBED_LINKS"],
    aliases: [],
    cooldown: 4,
    guildOnly: true,
};