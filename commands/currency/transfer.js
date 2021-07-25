exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);
    if (!member) return message.inlineReply("who do you want to send token to?");
    const user = member.user;
    if (user.id === client.user.id) return message.inlineReply("wow you are so generous but.. that's me.");
    if (user.bot) return message.inlineReply("that user is a bot.");
    if (user.id === message.author.id) return message.inlineReply("why do you want to transfer a credit to yourself?");

    let amount = parseInt(args[1]);
    if (!amount) return message.inlineReply("please input the amount of credits that you want to transfer!");
    if (isNaN(amount)) return message.inlineReply("that was not a valid number!");

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
    let balance = storage.balance;

    if (!balance || balance == 0) return message.inlineReply("your wallet is empty. broke. nothing is there :anguished:");
    if (amount > balance) return message.inlineReply("you don't have that enough credits to transfer!");
    if (amount === 0) return message.inlineReply("why did you transfer nothing?");
    await client.money.findOneAndUpdate({
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
    await client.money.findOneAndUpdate({
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
}

exports.help = {
    name: "transfer",
    description: "transfer tokens to an another user.",
    usage: ["transfer `<@user> <amount>`", "transfer `<user ID> <amount>`"],
    example: ["transfer `@coconut#1337 50`", "transfer `444177575757 50`"]
}

exports.conf = {
    aliases: ["tf"],
    cooldown: 15,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}