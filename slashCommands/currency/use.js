const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const toUse = interaction.options.getString('item');
    await interaction.deferReply();
    let storage = await client.db.inventory.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!storage) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `D: you don't have any item to use` }] });
    if (toUse.toLowerCase() === "ticket") {
        if (storage.eqTicket < 1) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `D: you don't have any ticket to use` }] });
        let cooldownStorage = await client.db.cooldowns.findOne({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
        if (!cooldownStorage) {
            const model = client.db.cooldowns
            cooldownStorage = new model({
                userId: interaction.user.id,
                guildId: interaction.guild.id
            });
        };
        let expire = cooldownStorage.ticketExpire;
        if (expire !== null && Date.now() < expire) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `you already have 1 🎫 ** Effect Ticket** in active! you can use it again <t:${Math.floor(expire / 1000)}:R> seconds!` }] });
        let cooldown = 8.64e+7;
        cooldownStorage.ticketExpire = Date.now() + cooldown;
        storage.eqTicket--;
        await storage.save();
        await cooldownStorage.save();
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `:white_check_mark: you used an 🎫 ** Effect Ticket**! it will be expired in a day!` }] });
    } else {
        return interaction.editReply(":thinking: you can't use this item, or it doesn't exist");
    }
};

exports.help = {
    name: "use",
    description: "use an item in your inventory",
    usage: ["use `<item>`"],
    example: ["use \`ticket\`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('item')
            .setRequired(true)
            .setDescription('what item that you want to use?')
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};