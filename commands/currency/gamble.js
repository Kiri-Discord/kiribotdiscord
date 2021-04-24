const ms = require("parse-ms");
const { MessageEmbed } = require("discord.js");
exports.run = async (client, message, args) => {
    const amount = args[0];
    if (!amount) return message.inlineReply("how much token do you want to contribute?");
    if (isNaN(amount)) return message.inlineReply("that amount was not a number :frowning:");
    let storage = await client.money.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!storage) {
        const model = client.money
        const newUser = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
        await newUser.save();
        storage = newUser;
    };
    let lastGamble = storage.lastGamble;
    let balance = storage.balance;
    if (amount > balance || !balance || balance === 0) return message.inlineReply("you don't have enough money duh");
    let cooldown = 25000;
    let pad_zero = num => (num < 10 ? '0' : '') + num;

    if (lastGamble !== null && cooldown - (Date.now() - lastGamble) > 0) {
        let timeObj = ms(cooldown - (Date.now() - lastGamble));
        let second = pad_zero(timeObj.seconds).padStart(2, "0");
        return message.inlineReply(`that was fast! you need to wait **${second}** second(s) before you can gambling again.\n*money is not a river*  - someone`);
    }
    const result = Math.floor(Math.random() * 10);

    if (result < 5) {
        const storageAfter = await client.money.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            lastGamble: Date.now(),
            $inc: {
                balance: -amount,
            }, 
        }, {
            upsert: true,
            new: true,
        });
        const embed = new MessageEmbed()
        .setDescription(`
        ⏣ **${amount}** token was taken from your wallet 💵

        current balance: **${storageAfter.balance}**
        `)
        .setFooter(`good luck next time :(`)
        .setTitle(`ahh, noooo! you lost ${amount} token, ${message.member.displayName}!`)
        .setThumbnail(message.author.displayAvatarURL({size: 1024, dynamic: true}))
        return message.channel.send(embed);
    } else if (result > 5) {
        const storageAfter = await client.money.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            lastGamble: Date.now(),
            $inc: {
                balance: amount,
            }, 
        }, {
            upsert: true,
            new: true,
        });
        const embed = new MessageEmbed()
        .setDescription(`
        ⏣ **${amount}** token was added to your wallet 💵

        current balance: **${storageAfter.balance}**
        `)
        .setFooter(`have fun!`)
        .setTitle(`yeeet! you won ${amount} token, ${message.member.displayName}!`)
        .setThumbnail(message.author.displayAvatarURL({size: 1024, dynamic: true}))
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
    userPerms: [],
    channelPerms: ["EMBED_LINKS"]
}