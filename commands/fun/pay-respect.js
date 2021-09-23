exports.run = async(client, message, args) => {
    if (!args[0]) {
        const msg = await message.channel.send("press 🇫 to pay respect.");
        await msg.react("🇫");

        const filter = async(reaction, user) => {
            if (user.bot) return false;
            if (reaction.emoji.name === "🇫") {
                const m = await message.channel.send(`**${user.username}** has paid their respect.`);
                setTimeout(() => {
                    m.delete();
                }, 5000);
                return true;
            } else return false;
        };

        const collected = await msg.awaitReactions({ filter, time: 15000 });
        if (!collected.size) return msg.reply('no one paid respect at all... what a shame :pensive:');
        const count = collected.get("🇫").count - 1;
        return message.channel.send(`**${count}** ${count === 1 ? 'has': 'have'} paid their respect.`);
    } else {
        let reason = args.join(" ");

        const msg = await message.channel.send(`press :regional_indicator_f:  to pay respect to **${reason}**`);
        await msg.react("🇫");

        const filter = async(reaction, user) => {
            if (user.bot) return false;
            if (reaction.emoji.name === "🇫") {
                const m = await message.channel.send(`**${user.username}** has paid their respect.`)
                setTimeout(() => {
                    m.delete();
                }, 5000);
                return true;
            } else return false;
        };
        const collected = await msg.awaitReactions({ filter, time: 30000 });
        if (!collected.size) return msg.reply('no one paid respect at all... what a shame :pensive:');
        const count = collected.get("🇫").count - 1;
        return message.channel.send(`**${count}** person${count === 1 ? '': 's'} paid their respect to **${reason}**`)
    };
};

exports.help = {
    name: "pay-respect",
    description: "pay respect to someone or a reason",
    usage: ["pay-respect", "pay-respect `[reason]`", "pay-respect `[@user]`", "pay-respect `[@user]` `[reason]`"],
    example: ["pay-respect", "pay-respect `@coconut`", "pay-respect `@coconut :v`"]
};

exports.conf = {
    aliases: ["f"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ADD_REACTIONS"]
};