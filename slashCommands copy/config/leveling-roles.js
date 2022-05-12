const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    if (interaction.options.getSubcommand() === "set") {
        const level = interaction.options.getInteger('level');
        const role = interaction.options.getRole('role')

        if (role.name === "@everyone") return interaction.reply({ embeds: [{ color: "RED", description: `\`@everyone\` is not a valid role!` }], ephemeral: true });
        if (role.name === "@here") return interaction.reply({ embeds: [{ color: "RED", description: `\`@here\` is not a valid role!` }], ephemeral: true });
    
        if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= role.position) return interaction.reply({ embeds: [{ color: "RED", description: `that role is higher or equal your highest role!` }], ephemeral: true });
    
        if (!role.editable) return interaction.reply({ embeds: [{ color: "RED", description: `that role is higher or equal my highest role!` }], ephemeral: true });

        await interaction.deferReply();
        const existingLevelReward = await client.db.levelingRewards.findOne({ guildId: interaction.guild.id, level: level });
        if (existingLevelReward) return interaction.editReply({ embeds: [{ color: "RED", description: `a reward for level **${level}** already exists! to set a new role for the reward, run \`/leveling-roles remove ${level}\` :slight_smile:` }], });

        await client.db.levelingRewards.findOneAndUpdate({
            guildId: interaction.guild.id,
            roleId: role.id
        }, {
            guildId: interaction.guild.id,
            roleId: role.id,
            level
        }, {
            upsert: true,
            new: true,
        });

        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `the reward when reaching level **${level}** has been set to ${role.toString()} 🎉` }] });
    } else if (interaction.options.getSubcommand() === "remove") {
        const level = interaction.options.getInteger('level');
        await interaction.deferReply();
        const roleReward = await client.db.levelingRewards.findOne({
            guildId: interaction.guild.id,
            level
        });
        if (!roleReward) return interaction.editReply({ embeds: [{ color: "RED", description: `no existing reward with that level requirement was found!` }] });

        await client.db.levelingRewards.findOneAndDelete({
            guildId: interaction.guild.id,
            level
        });
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `the role reward when reaching level **${level}** has been removed 🗑` }] });
    }
}


exports.help = {
    name: "leveling-roles",
    description: "setup reward as roles to add when a user reaches a certain level, or remove an existing role reward",
    usage: ["leveling-roles \`set <level> <@Role>\`", "leveling-roles \`remove <level>\`"],
    example: ["leveling-roles \`set 10 @Level 10\`", "leveling-roles \`remove 25\`"]
};

exports.conf = {
    cooldown: 4,
    guildOnly: true,
    data: new SlashCommandBuilder()
    .setName(exports.help.name)
    .setDescription(exports.help.description)
    .addSubcommand(subcommand =>
        subcommand
        .setName('remove')
        .setDescription('delete an existing role reward')
        .addIntegerOption(option => option
            .setMinValue(1)
            .setName('level')
            .setDescription('the level requirement of the reward that you want to remove')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName('set')
        .setDescription('add a new role reward that will be given when a user reaches a certain level')
        .addIntegerOption(option => option
            .setMinValue(1)
            .setName('level')
            .setDescription('the level requirement of the reward that you want to add')
            .setRequired(true)
        )
        .addRoleOption(option => option
            .setName('role')
            .setRequired(true)
            .setDescription('the role that will be given when a user reaches the level requirement')
        )
    ),
    userPerms: ["MANAGE_GUILD"],
    clientPerms: ["MANAGE_ROLES"],
    channelPerms: ["EMBED_LINKS"]
};