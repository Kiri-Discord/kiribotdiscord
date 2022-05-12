const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('user') || interaction.member;
    const user = member.user;
    if (user.id === client.user.id) return interaction.reply({
        embeds: [{
            description: "that's me! did you think i have any money? :pensive:"
        }],
        ephemeral: true
    });
    if (user.bot) return interaction.reply({
        embeds: [{
            description: "duh you can't ask a bot's balance. we are broke enough :pensive:"
        }],
        ephemeral: true
    });
    await interaction.deferReply();
    let cooldown = 8.64e+7;
    let storage = await client.db.money.findOne({
        userId: user.id,
        guildId: interaction.guild.id
    });
    if (!storage) {
        const model = client.db.money;
        storage = new model({
            userId: user.id,
            guildId: interaction.guild.id
        });
    };
    let cooldownStorage = await client.db.cooldowns.findOne({
        userId: user.id,
        guildId: interaction.guild.id
    });
    if (!cooldownStorage) {
        const model = client.db.cooldowns;
        cooldownStorage = new model({
            userId: user.id,
            guildId: interaction.guild.id
        });
    };
    let lastDaily;
    let msLastDaily = cooldownStorage.lastDaily;
    let balance = storage.balance;
    if (msLastDaily !== null && cooldown - (Date.now() - msLastDaily) > 0) {
        let finalTime = cooldown - (Date.now() - msLastDaily);
        lastDaily = `<t:${Math.floor((Date.now() + finalTime) / 1000)}:R>`
    } else {
        lastDaily = 'ready to collect';
    }
    const embed = new MessageEmbed()
        .setColor("#bee7f7")
        .setTitle(`${user.username}'s balance`)
        .setDescription(stripIndents `
        wallet: ⏣ __${balance}__ token(s)
        time until next daily collect: **${lastDaily}**
        `)
        .setTimestamp()
    return interaction.editReply({ embeds: [embed] });
};

exports.help = {
    name: "balance",
    description: "check yours, or other members money.",
    usage: ["balance \`[@user]\`", "balance \`[user ID]\`", "balance"],
    example: ["balance `@eftw`", "balance"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(false)
            .setDescription('which member that you want to see their balance? :)')
        ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};