const ms = require("parse-ms");
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
        await storage.save();
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
        await cooldownStorage.save();
    };
    let lastGamble = cooldownStorage.lastGamble;
    let balance = storage.balance;
    if (amount > balance || !balance || balance === 0) return message.reply("you don't have enough money duh");
    let cooldown = 25000;
    let pad_zero = num => (num < 10 ? '0' : '') + num;

    if (lastGamble !== null && cooldown - (Date.now() - lastGamble) > 0) {
        let timeObj = ms(cooldown - (Date.now() - lastGamble));
        let second = pad_zero(timeObj.seconds).padStart(2, "0");
        return message.reply(`that was fast! you need to wait **${second}** second(s) before you can gambling again.\n*money is not a river*  - someone`);
    }
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
        return message.channel.send(embed);
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
        return message.channel.send(embed);
    }
}

exports.help = {
    name: "gamble",
    description: "double your token. in an effficent way ¯\\_(ツ)_/¯",
    usage: "gamble `<bet/amount>`",
    example: "gamble `50`"
}

exports.conf = {
    aliases: ["gambling", "bet"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}