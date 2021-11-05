exports.run = async(client, message, args, prefix) => {
    const voted = await client.vote.findOne({
        userID: message.author.id
    });
    if (!voted) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `D: you haven't vote yet! visit \`${prefix}vote\` and vote for me to get a free **🎫 Effect Ticket**` }] });
    let storage = await client.inventory.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!storage) {
        const model = client.inventory;
        storage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
    };
    storage.eqTicket += 1;
    await client.vote.findOneAndDelete({
        userID: message.author.id
    });
    await storage.save();
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:white_check_mark: you've got a 🎫 ** Effect Ticket**! do \`${prefix}use ticket\` to activate the ticket for a day!` }] });
};
exports.help = {
    name: "ticket",
    description: "obtain music effect ticket from your vote",
    usage: ["ticket"],
    example: ["ticket"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};