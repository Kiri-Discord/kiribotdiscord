const { SlashCommandBuilder } = require('@discordjs/builders');
exports.run = async(client, interaction) => {
    const user = interaction.options.getUser('user');
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed').toString() : ':pensive:'

    if (user.id === client.user.id) return interaction.reply({ content: 'to.. to me? if you want to confess something, just say it directly!', ephemeral: true })
    if (user.bot) return interaction.reply({ content: `you can't confess to bot, sorry ${sedEmoji}`, ephemeral: true });
    if (user.id === interaction.user.id) return interaction.reply({ content: `you can't confess to yourself ${sedEmoji}`, ephemeral: true });

    const text = interaction.options.getString('confession');
    await interaction.deferReply({ ephemeral: true });
    await client.confession.findOneAndUpdate({
        guildId: interaction.guild.id,
        userId: user.id
    }, {
        guildId: interaction.guild.id,
        userId: user.id,
        confession: text
    }, {
        upsert: true,
        new: true,
    });
    return interaction.editReply(`✉️ done! your confession has been recorded, and i will send it to **${user.tag}** when they get online!`);
};
exports.help = {
    name: "confess",
    description: "confess to somebody annoymously",
    usage: ["confess `<@user> <confession>`"],
    example: ["confess `@somebody i ate your cookies`", "confess"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(true)
            .setDescription('who would you like to confess to?')
        )
        .addStringOption(option => option
            .setName('confession')
            .setDescription('what would you like to confess?')
            .setRequired(true)
        ),
    cooldown: 3,
    guildOnly: true,
};