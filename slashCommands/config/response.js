const types = ["cute", "natural"];
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const type = interaction.options.getString('style').trim().toLowerCase();
    if (!types.includes(type)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `**${type}** isn't a valid response mode dear :pensive: all my avaliable response styles are \`${types.join(', ')}\`` }], ephemeral: true })
    const db = client.guildsStorage.get(interaction.guild.id);
    await interaction.deferReply();
    db.responseType = type;
    await client.dbguilds.findOneAndUpdate({
        guildID: interaction.guild.id,
    }, {
        responseType: type
    });
    return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `☑️ my message response type was changed to \`${type}\` mode` }] });
}

exports.help = {
    name: "response",
    description: "change my response messages style (avaliable in join/leave message)",
    usage: ["response `<style>`"],
    example: ["response `natural`"]
};

exports.conf = {
    guild: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('style')
            .setDescription('the response type that you want to choose')
            .setRequired(true)
        ),
    cooldown: 4,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};