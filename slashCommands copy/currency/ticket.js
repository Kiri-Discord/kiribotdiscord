const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    const voted = await client.db.vote.findOne({
        userID: interaction.user.id
    });
    if (!voted) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `D: you haven't vote yet! visit \`/vote\` and vote for me to get a free **🎫 Effect Ticket**` }] });
    let storage = await client.db.inventory.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!storage) {
        const model = client.db.inventory;
        storage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
    };
    storage.eqTicket += 1;
    await client.db.vote.findOneAndDelete({
        userID: interaction.user.id
    });
    await storage.save();
    return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `:white_check_mark: you've got a 🎫 ** Effect Ticket**! do \`/use ticket\` to activate the ticket for a day!` }] });
};
exports.help = {
    name: "ticket",
    description: "obtain music effect ticket from your vote",
    usage: ["ticket"],
    example: ["ticket"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};