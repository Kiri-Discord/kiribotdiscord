const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const list = require('../../assets/items.json');

exports.run = async(client, interaction) => {
    const amount = interaction.options.getInteger('amount');
    if (amount < 0) return interaction.reply({ content: 'the amount of item that you want to buy must not be lower than 0 :pensive:', ephemeral: true })
    const items = Object.keys(list);
    const toBuy = interaction.options.getString('item');
    if (!items.includes(toBuy)) return interaction.reply({ content: `\`${toBuy}\` is an invalid item! check \`/shop\` for a list of avaliable item :grin:`, ephemeral: true });
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
        const items = quantity < 1 ? list[item].displayName : list[item].displayName + 's';
        const embed = new MessageEmbed()
            .setColor("#bee7f7")
            .setAuthor('purchase successful (=^･ω･^=)', interaction.user.displayAvatarURL())
            .setDescription(`you have bought __${quantity}__ **${items}** (⏣ ${price}) which cost you ⏣ __${total}__ token`)
            .setFooter(`your current balance: ⏣ ${money - price}`)

        if (item === 'rings') {
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

        if (item === 'seeds') {
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

        if (item === 'worms') {
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
        if (item === 'eqTicket') {
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
        moneyStorage.balance = moneyStorage.balance - total;
        await moneyStorage.save();
        return interaction.editReply({ embeds: [embed] });
    };
    if (toBuy === 'rings') {
        buyItem(money, 1300, amount, toBuy)
    };

    if (toBuy === 'seeds') {
        buyItem(money, 50, amount, toBuy)
    };

    if (toBuy === 'worms') {
        buyItem(money, 150, amount, toBuy)
    };
    if (toBuy === 'eqTicket') {
        buyItem(money, 500, amount, toBuy)
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
            .setDescription('the id of the item that you want to buy. check /shop to know what you can buy <3')
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};