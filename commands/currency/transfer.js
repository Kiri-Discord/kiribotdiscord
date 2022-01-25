exports.run = async(client, message, args) => {
    const member = client.utils.parseMember(message, args[0])
    if (!member) return message.reply("who do you want to send token to?");
    const user = member.user;
    if (user.id === client.user.id) return message.reply("wow you are so generous but.. that's me.");
    if (user.bot) return message.reply("that user is a bot.");
    if (user.id === message.author.id) return message.reply("why do you want to transfer a credit to yourself?");
    if (!args[1]) return message.reply("please input the amount of credits that you want to transfer!");
    let amount = parseInt(args[1]);
    if (isNaN(amount)) return message.reply("that was not a valid number!");
    if (amount === 0 || amount < 0) return message.reply("that is an invalid amount of token! you can't neither transfer nothing or using a negative amount :pensive:");
    let storage = await client.db.money.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!storage) {
        const model = client.db.money
        storage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
    };
    let balance = storage.balance;

    if (!balance || balance == 0) return message.reply("your wallet is empty. broke. nothing is there :anguished:");
    if (amount > balance) return message.reply("you don't have that enough credits to transfer!");
    await client.db.money.findOneAndUpdate({
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
    await client.db.money.findOneAndUpdate({
        userId: user.id,
        guildId: message.guild.id
    }, {
        userId: user.id,
        guildId: message.guild.id,
        $inc: {
            balance: amount,
        },
    }, {
        upsert: true,
        new: true,
    });

    return message.channel.send(`💸 you've transferred to **${user.tag}** ⏣ **${amount}** credits!`);
};

exports.help = {
    name: "transfer",
    description: "transfer tokens to an another user.",
    usage: ["transfer `<@user> <amount>`", "transfer `<user ID> <amount>`"],
    example: ["transfer `@coconut#1337 50`", "transfer `444177575757 50`"]
};

exports.conf = {
    aliases: ["give"],
    cooldown: 15,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};