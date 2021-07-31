const { MessageEmbed } = require("discord.js");
const humanizeDuration = require("humanize-duration");
const { stripIndents } = require('common-tags');
exports.run = async(client, message, args) => {
        let cooldown = 8.64e+7;
        let money = await client.money.findOne({
            userId: message.author.id,
            guildId: message.guild.id
        });
        if (!money) {
            const model = client.money
            money = new model({
                userId: message.author.id,
                guildId: message.guild.id
            });
            await money.save();
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
        let lastDaily = cooldownStorage.lastDaily;
        try {
            if (lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0) {
                let finalTime = humanizeDuration(cooldown - (Date.now() - lastDaily))
                const embed = new MessageEmbed()
                    .setColor("#bee7f7")
                    .setDescription(stripIndents `
                    sorry, you cannot collect your daily too early :pensive:
                    your next collect is ready in: **${finalTime}**

                    ~~want to get more token on your next daily collect? vote me [here](https://discord.ly/sefy)~~ (currently in maintenance)`)
                    .setTitle(`${message.member.displayName}, you've already claimed your daily today!`)
                    .setFooter(`each daily is reseted after 24 hours, regardless of timezone.`)
                return message.channel.send(embed);
            } else {
                let bonus;
                let bonusAmount;
                let finalAmount;
                let amount = getRandomInt(10, 30);
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
                    bonusAmount = calcBonus(amount)
                    finalAmount = amount + bonusAmount
                };
                await client.cooldowns.findOneAndUpdate({
                    guildId: message.guild.id,
                    userId: message.author.id
                }, {
                    guildId: message.guild.id,
                    userId: message.author.id,
                    lastDaily: Date.now()
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
            .setTitle(`here are your daily token, ${message.member.displayName}!`)
            return message.channel.send(embed);
        }
    } catch (error) {
        console.log(error);
        return message.inlineReply(`sorry :( i got an error. try again later!`);
    }
}

exports.help = {
    name: "daily",
    description: "collect your daily credits. (reseted after 24 hours)",
    usage: 'daily',
    example: 'daily'
}

exports.conf = {
    aliases: ["dailies", 'claim', 'collect'],
    cooldown: 10,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function calcBonus(value) {
    return parseInt((value / 2).toFixed(0))
};
