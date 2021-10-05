const { MessageEmbed } = require("discord.js");
const { stripIndents } = require('common-tags');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
        let cooldown = 8.64e+7;
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
        let lastDaily = cooldownStorage.lastDaily;
        try {
            if (lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0) {
                let finalTime = cooldown - (Date.now() - lastDaily);

                const embed = new MessageEmbed()
                    .setColor("#bee7f7")
                    .setDescription(stripIndents `
                    sorry, you cannot collect your daily too early :pensive:
                    your next collect is ready <t:${Math.floor((Date.now() + finalTime) / 1000)}:R>

                    ~~want to get more token on your next daily collect? vote me [here](https://discord.ly/kiri)~~ (currently in maintenance)`)
                    .setTitle(`${interaction.member.displayName}, you've already claimed your daily today!`)
                    .setFooter(`each daily is reseted after 24 hours, regardless of timezone.
                    `)
                return interaction.editReply({ embeds: [embed] });
            } else {
                let bonus;
                let bonusAmount;
                let finalAmount;
                let amount = getRandomInt(10, 30);
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
                    bonusAmount = calcBonus(amount)
                    finalAmount = amount + bonusAmount
                };
                await client.cooldowns.findOneAndUpdate({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id
                }, {
                    guildId: interaction.guild.id,
                    userId: interaction.user.id,
                    lastDaily: Date.now()
                }, {
                    upsert: true,
                    new: true,
                });
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
                    .setDescription(stripIndents `
            ⏣ __${finalAmount}__ token was placed in your wallet 🙂

            ~~you can get more rewards by voting!~~ (currently in maintenance)
            ${bonus ? `you collected __${bonusAmount}__ more token for voting :)` : ''}
            `)
            .setColor("#bee7f7")
            .setFooter(`current balance: ⏣ ${storageAfter.balance} token`)
            .setTitle(`here are your daily token, ${interaction.member.displayName}!`)
            return interaction.editReply({embeds: [embed]});
        }
    } catch (error) {
        logger.log('error', error);
        return interaction.editReply(`sorry, i got an error! try again later! :pensive:`);
    };
};

exports.help = {
    name: "daily",
    description: "collect your daily credits. (reseted after 24 hours)",
    usage: ['daily'],
    example: ['daily']
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    guild: true,
    cooldown: 10,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
function calcBonus(value) {
    return parseInt((value / 2).toFixed(0))
};