const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms');
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
            const remaining = cooldown - (Date.now() - lastGamble);
            return interaction.editReply(`that was fast! you need to wait **${ms(remaining, { long: true })}** before you can gambling again.\n*money is not a river*  - someone`);
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
                .setColor("#bee7f7")
                .setDescription(`⏣ **${amount}** token was taken from your wallet 💵`)
                .setFooter({text: `current balance: ⏣ ${storageAfter.balance} token`})
                .setTitle(`ahh, noooo! you lost, ${interaction.member.displayName}!`)
            return interaction.editReply({ embeds: [embed] });
        } else {
            let bonus;
            let bonusAmount;
            let finalAmount;
            const voted = await client.vote.findOne({
                userID: interaction.user.id
            });
            if (!voted) {
                bonus = false;
                finalAmount = amount;
            } else {
                bonus = true;
                await client.vote.findOneAndDelete({
                    userID: interaction.user.id
                });
                bonusAmount = calcBonus(amount, voted.collectMutiply || 50);
                finalAmount = parseInt(amount) + bonusAmount;
            };
            const storageAfter = await client.money.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                $inc: {
                    balance: finalAmount,
                },
            }, {
                upsert: true,
                new: true,
            });
            const embed = new MessageEmbed()
                .setColor("#bee7f7")
                .setDescription(`⏣ **${finalAmount}** token was added to your wallet!\n\nyou can get more rewards by voting [here](https://top.gg/bot/859116638820761630)${bonus ? `\nyou collected __${bonusAmount}__ more token for voting :)` : ''}`)
                .setFooter({text: `current balance: ${storageAfter.balance}`})
                .setTitle(`yeeet! you won, ⏣ ${interaction.member.displayName}!`)
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
            .setMinValue(1)
            .setName('amount')
            .setDescription('how much token do you want to contribute?')
            .setRequired(true)
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};

function calcBonus(value, mutiply) {
    return Math.floor((mutiply / 100) * parseInt(value));
};