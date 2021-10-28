const { time, SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

exports.run = async(client, interaction) => {
    const amount = interaction.options.getInteger('amount');

    if (amount < 0) return interaction.reply({ content: 'the amount of token that you want to bet must not be lower than 0 :pensive:', ephemeral: true })
    let storage = await client.money.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!storage) {
        const model = client.money
        storage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
    };
    await interaction.deferReply();
    let cooldownStorage = await client.cooldowns.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!cooldownStorage) {
        const model = client.cooldowns
        cooldownStorage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
    };
    let lastGamble = cooldownStorage.lastGamble;
    let balance = storage.balance;
    if (amount > balance || !balance) return interaction.editReply("you don't have enough money duh");
    let cooldown = 25000;

    if (lastGamble !== null && cooldown - (Date.now() - lastGamble) > 0) {
        const target = cooldown - (Date.now() - lastGamble);
        const remaining = time(Math.floor((Date.now() + target) / 1000), "R")
        return interaction.editReply(`that was fast! you need to wait ${remaining} before you can gambling again.\n*money is not a river*  - someone`);
    };
    const result = Math.floor(Math.random() * 10);

    await client.cooldowns.findOneAndUpdate({
        guildId: interaction.guild.id,
        userId: interaction.user.id
    }, {
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        lastGamble: Date.now()
    }, {
        upsert: true,
        new: true,
    });

    if (result < 5) {
        const storageAfter = await client.money.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            $inc: {
                balance: -amount,
            },
        }, {
            upsert: true,
            new: true,
        });
        const embed = new MessageEmbed()
            .setDescription(`⏣ **${amount}** token was taken from your wallet 💵`)
            .setFooter(`current balance: ⏣ ${storageAfter.balance} token`)
            .setTitle(`ahh, noooo! you lost, ${interaction.member.displayName}!`)
        return interaction.editReply({ embeds: [embed] });
    } else {
        const storageAfter = await client.money.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            $inc: {
                balance: amount,
            },
        }, {
            upsert: true,
            new: true,
        });
        const embed = new MessageEmbed()
            .setDescription(`⏣ **${amount}** token was added to your wallet!`)
            .setFooter(`current balance: ${storageAfter.balance}`)
            .setTitle(`yeeet! you won, ${interaction.member.displayName}!`)
        return interaction.editReply({ embeds: [embed] });
    };
};

exports.help = {
    name: "gamble",
    description: "double your token. in an effficent way ¯\\_(ツ)_/¯",
    usage: ["gamble `<bet/amount>`"],
    example: ["gamble `50`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('how much token do you want to contribute?')
            .setRequired(true)
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};