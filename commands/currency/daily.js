const { MessageEmbed } = require("discord.js");
const humanizeDuration = require("humanize-duration");
exports.run = async (client, message, args) => {
    let cooldown = 8.64e+7;
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
    }
    let lastDaily = storage.lastDaily;
    try {
        
        if (lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0) {
            let finalTime = humanizeDuration(cooldown - (Date.now() - lastDaily))
            const embed = new MessageEmbed()
            .setDescription(`
            💸 sorry, you cannot collect your daily too early :pensive:

            your next collect is ready in:
            \`${finalTime}\`
            `)
            .setTitle(`${message.member.displayName}, you've already claimed your daily today!`)
            .setThumbnail(message.author.displayAvatarURL({size: 1024, dynamic: true}))
            .setFooter(`each daily is reseted after 24 hours, regardless of timezone.`)
            return message.channel.send(embed);
        } else {
            let amount = getRandomInt(10, 50);
            const storageAfter = await client.money.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                lastDaily: Date.now(),
                $inc: {
                    balance: amount,
                }, 
            }, {
                upsert: true,
                new: true,
            });
            const embed = new MessageEmbed()
            .setDescription(`
            ⏣ **${amount}** token was placed in your wallet 💵

            current balance: **${storageAfter.balance}**
            `)
            .setFooter(`each daily is reseted after 24 hours, regardless of timezone.`)
            .setTitle(`here are your daily token, ${message.member.displayName}!`)
            .setThumbnail(message.author.displayAvatarURL({size: 1024, dynamic: true}))
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
    aliases: ["dailies"],
    cooldown: 10,
    guildOnly: true,
    userPerms: [],
    channelPerms: ["EMBED_LINKS"]
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
