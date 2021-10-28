const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    let money = await client.money.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!money) {
        const model = client.money
        money = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        });
    };
    let storage = await client.inventory.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!storage) {
        const model = client.inventory
        storage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
    };
    const embed = new MessageEmbed()
        .setAuthor(`${interaction.user.username}'s inventory 🎒`, interaction.user.displayAvatarURL())
        .setColor("#bee7f7")
        .addField(`💍 wedding rings`, `\`${storage.rings}\``, true)
        .addField(`🌰 seeds`, `\`${storage.seeds}\``, true)
        .addField(`🪱 worms`, `\`${storage.worms}\``, true)
        .setFooter(`your current balance: ⏣ ${money.balance}`)
    return interaction.editReply({ embeds: [embed] })
};

exports.help = {
    name: "inventory",
    description: "shows everything you own in your inventory.",
    usage: ["inventory"],
    example: ["inventory"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 2,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};