exports.run = async(client, message, args, prefix) => {
    if (!args[0]) return message.channel.send(`${message.author.username}, you need to specify an item to use!`);
    let storage = await client.inventory.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!storage) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `D: you don't have any item to use` }] });
    if (args[0].toLowerCase() === "ticket") {
        if (storage.eqTicket < 1) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `D: you don't have any ticket to use` }] });
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
        let expire = cooldownStorage.ticketExpire;
        if (expire !== null && Date.now() < expire) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you already have 1 🎫 ** Effect Ticket** in active! you can use it again <t:${Math.floor(expire / 1000)}:R> seconds!` }] })
        let cooldown = 8.64e+7;
        cooldownStorage.ticketExpire = Date.now() + cooldown;
        storage.eqTicket--;
        await storage.save();
        await cooldownStorage.save();
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:white_check_mark: you used an 🎫 ** Effect Ticket**! it will be expired in a day!` }] });
    } else {
        return message.channel.send(":thinking: you can't use this item, or it doesn't exist");
    }
};

exports.help = {
    name: "use",
    description: "use an item in your inventory",
    usage: ["use `<item>`"],
    example: ["use \`ticket\`"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};