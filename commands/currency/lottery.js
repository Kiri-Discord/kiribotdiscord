const { stripIndents } = require('common-tags');
const prizes = ['⏣ 0', '⏣ 2', '⏣ 4', '⏣ 10', '⏣ 500', '⏣ 1,000,000', '⏣ 5,000,000'];
const ms = require('ms');
const prizesToNumber = {
    '⏣ 0': 0,
    '⏣ 2': 2,
    '⏣ 4': 4,
    '⏣ 10': 10,
    '⏣ 500': 500,
    '⏣ 1,000,000': 1000000,
    '⏣ 5,000,000': 5000000
};
const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args) => {
    let cooldown = 8.64e+7;
    const stare = client.customEmojis.get('stare');
    if (!args.length) return message.reply(`you didn't provide any number ${stare} you need to provide 6 numbers to guess for the lottery!`);
    if (args.some(a => isNaN(a))) return message.reply("some number you provided was not a number :frowning: you must choose an array of number that lay between 1 and 70!");
    const owostab = client.customEmojis.get('owostab');
    if (args.some(a => a < 1 || a > 70)) return message.reply(`some number you choose was lower than 1 or greater than 70 ${owostab}`);
    let cooldownStorage = await client.cooldowns.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!cooldownStorage) {
        const model = client.cooldowns;
        cooldownStorage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
    };
    let lastLottery = cooldownStorage.lastLottery;
    if (lastLottery !== null && cooldown - (Date.now() - lastLottery) > 0) {
        const remaining = cooldown - (Date.now() - lastLottery);
        return message.reply(`that was fast! you need to wait **${ms(remaining, { long: true })}** before you can attempt to win a lottery again!`);
    };
    const lotto = Array.from({ length: 6 }, () => Math.floor(Math.random() * 70) + 1);
    const similarities = lotto.filter((num, i) => args[i] === num).length;
    const prize = prizes[similarities];
    const prizeNumber = prizesToNumber[prize];
    const emiliacry = client.customEmojis.get('emiliacry');
    const msg = prizeNumber > 0 ? 'congratulation :tada:' : `try again next time ${emiliacry}`;
    await client.cooldowns.findOneAndUpdate({
        guildId: message.guild.id,
        userId: message.author.id
    }, {
        guildId: message.guild.id,
        userId: message.author.id,
        lastLottery: Date.now()
    }, {
        upsert: true,
        new: true,
    });
    const storageAfter = await client.money.findOneAndUpdate({
        guildId: message.guild.id,
        userId: message.author.id
    }, {
        guildId: message.guild.id,
        userId: message.author.id,
        $inc: {
            balance: prizeNumber,
        },
    }, {
        upsert: true,
        new: true,
    });
    const embed = new MessageEmbed()
        .setColor('#bee7f7')
        .setDescription(stripIndents `
        **${lotto.join(', ')}**
        you matched **${similarities}** numbers, which gives you **${prize}**! ${msg}
        `)
        .setFooter(`you have ⏣ ${storageAfter.balance} in your wallet.`)
    return message.reply({ embeds: [embed] });
};

exports.help = {
    name: "lottery",
    description: "attempt to win the lottery with 6 numbers",
    usage: ["lottery `<number>`"],
    example: ["lottery `50`"]
};

exports.conf = {
    aliases: ['loto'],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};