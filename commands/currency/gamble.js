const ms = require('ms');
const { MessageEmbed } = require("discord.js");
exports.run = async(client, message, args) => {
        const amount = args[0];
        if (!amount) return message.reply("how much token do you want to contribute?");
        if (isNaN(amount)) return message.reply("that amount was not a number :frowning:");
        let storage = await client.money.findOne({
            userId: message.author.id,
            guildId: message.guild.id
        });
        if (!storage) {
            const model = client.money
            storage = new model({
                userId: message.author.id,
                guildId: message.guild.id
            });
        };
        let cooldownStorage = await client.cooldowns.findOne({
            userId: message.author.id,
            guildId: message.guild.id
        });
        if (!cooldownStorage) {
            const model = client.cooldowns
            cooldownStorage = new model({
                userId: message.author.id,
                guildId: message.guild.id
            });
        };
        let lastGamble = cooldownStorage.lastGamble;
        let balance = storage.balance;
        if (amount > balance || !balance) return message.reply("you don't have enough money duh");
        let cooldown = 25000;

        if (lastGamble !== null && cooldown - (Date.now() - lastGamble) > 0) {
            const remaining = cooldown - (Date.now() - lastGamble);
            return message.reply(`that was fast! you need to wait **${ms(remaining, { long: true })}** before you can gambling again.\n*money is not a river*  - someone`);
        };
        const result = Math.floor(Math.random() * 10);

        await client.cooldowns.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            lastGamble: Date.now()
        }, {
            upsert: true,
            new: true,
        });

        if (result < 5) {
            const storageAfter = await client.money.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
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
                .setTitle(`ahh, noooo! you lost, ${message.member.displayName}!`)
            return message.channel.send({ embeds: [embed] });
        } else {
            let bonus;
            let bonusAmount;
            let finalAmount;
            const voted = await client.vote.findOne({
                userID: message.author.id
            });
            if (!voted) {
                bonus = false;
                finalAmount = amount;
            } else {
                bonus = true;
                await client.vote.findOneAndDelete({
                    userID: message.author.id
                });
                bonusAmount = calcBonus(amount, voted.collectMutiply || 50);
                finalAmount = parseInt(amount) + bonusAmount;
            };
            const storageAfter = await client.money.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                $inc: {
                    balance: finalAmount,
                },
            }, {
                upsert: true,
                new: true,
            });
            const embed = new MessageEmbed()
                .setDescription(`⏣ **${finalAmount}** token was added to your wallet!\n\nyou can get more rewards by voting [here](https://top.gg/bot/859116638820761630)${bonus ? `you collected __${bonusAmount}__ more token for voting :)` : ''}`)
            .setFooter(`current balance: ${storageAfter.balance}`)
            .setTitle(`yeeet! you won, ${message.member.displayName}!`)
        return message.channel.send({ embeds: [embed] });
    };
};

exports.help = {
    name: "gamble",
    description: "double your token. in an effficent way ¯\\_(ツ)_/¯",
    usage: ["gamble `<bet/amount>`"],
    example: ["gamble `50`"]
};

exports.conf = {
    aliases: ["gambling", "bet"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};

function calcBonus(value, mutiply) {
    return Math.floor((mutiply / 100) * value);
};