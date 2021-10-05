const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const amount = interaction.options.getInteger('amount');
    if (amount < 0) return interaction.reply({ content: 'the amount of item that you want to buy must not be lower than 0 :pensive:', ephemeral: true })
    const items = ['wedding ring', 'seed', 'worm', 'ring'];
    const toBuy = interaction.options.getString('item');
    if (!items.includes(toBuy.toLowerCase())) return interaction.reply({ content: `\`${toBuy}\` is an invalid item! check \`/shop\` for a list of avaliable item :grin:`, ephemeral: true });
    await interaction.deferReply();
    let moneyStorage = await client.money.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!moneyStorage) {
        const model = client.money
        moneyStorage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        });
    };
    const money = moneyStorage.balance;

    async function buyItem(money, price, quantity, item) {
        const total = price * quantity;
        if (money < price * quantity) return interaction.editReply(`you don't have that much money in your balance :pensive:\na total of ⏣ __${total - money}__ token is needed to buy it.`)
        const items = quantity < 1 ? item : item + 's';
        const embed = new MessageEmbed()
            .setColor("#bee7f7")
            .setAuthor('purchase successful (=^･ω･^=)', interaction.user.displayAvatarURL())
            .setDescription(`you have bought __${quantity}__ **${items}** (⏣ ${price}) which cost you ⏣ __${total}__ token`)
            .setFooter(`your current balance: ⏣ ${money - price}`)
        interaction.editReply({ embeds: [embed] })

        if (item === 'wedding ring' || item === 'ring') {
            await client.inventory.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                $inc: {
                    rings: quantity,
                },
            }, {
                upsert: true,
                new: true,
            });
        };

        if (item === 'seed') {
            await client.inventory.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                $inc: {
                    seeds: quantity,
                },
            }, {
                upsert: true,
                new: true,
            });
        };

        if (item === 'worm') {
            await client.inventory.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                $inc: {
                    worms: quantity,
                },
            }, {
                upsert: true,
                new: true,
            });
        };
    };
    if (toBuy.toLowerCase() === 'wedding ring' || toBuy.toLowerCase() === 'ring') {
        buyItem(money, 1300, amount, toBuy.toLowerCase())
    };

    if (toBuy.toLowerCase() === 'seed') {
        buyItem(money, 50, amount, toBuy.toLowerCase())
    };

    if (toBuy === 'worm') {
        buyItem(money, 150, amount, toBuy.toLowerCase())
    };
};

exports.help = {
    name: "buy",
    description: "buy an item from the store",
    usage: ["buy `<amount> <items>`"],
    example: ["buy `seeds 10`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('how many items that you want to buy?')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('item')
            .setRequired(true)
            .setDescription('what item that you want to buy? check /shop to know what you can buy <3')
        ),
    guild: true,
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};