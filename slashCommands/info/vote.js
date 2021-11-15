const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    const votes = await client.vote.find({
        userID: interaction.user.id
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
        ⏣ **50% to 80%** bonus from your daily rewards \`/daily\`
        🎫 **1 Effect Ticket** \`/ticket\`
        `)
    return interaction.editReply({ embeds: [embed], components: [row] });
};



exports.help = {
    name: "vote",
    description: "get the links to vote for me and exchange for cool rewards!",
    usage: ["vote"],
    example: ["vote"]
};

exports.conf = {
    channelPerms: ["EMBED_LINKS"],
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 4
};