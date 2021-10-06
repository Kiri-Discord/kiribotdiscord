const { time } = require('@discordjs/builders');
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
        const target = cooldown - (Date.now() - lastGamble);
        const remaining = time(Math.floor((Date.now() + target) / 1000), "R")
        return message.reply(`that was fast! you need to wait ${remaining} before you can gambling again.\n*money is not a river*  - someone`);
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
        const storageAfter = await client.money.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
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