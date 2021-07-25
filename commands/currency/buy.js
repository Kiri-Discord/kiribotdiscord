const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    if (!args[0]) return message.inlineReply(`how many items do you want to buy? please check \`${prefix}help buy\` if you encounter any problem :grin:`);

    function isInt(value) {
        if (isNaN(value)) {
            return false;
        }
        var x = parseFloat(value);
        return (x | 0) === x;
    };

    if (isNaN(args[0]) || !isInt(args[0]) || Math.sign(args[0]) === -1) return message.inlineReply('that isn\'t a vaild number! can you try again? :pensive:')
    const items = ['wedding ring', 'seed', 'worm', 'ring'];
    const toBuy = args.slice(1).join(' ');
    if (!toBuy) return message.inlineReply(`what item do you want to buy? for a list of item that you can purchase, please check \`${prefix}shop\` <3`)
    if (!items.includes(toBuy.toLowerCase())) return message.inlineReply(`\`${toBuy}\` is an invalid item :pensive: check \`${prefix}shop\` for a list of avaliable item :grin:`);

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
    const money = storage.balance;

    function buyItem(money, price, quantity, item) {
        const total = price * quantity
        if (money < price * quantity) return message.inlineReply(`you don't have that much money in your balance :pensive:\na total of ⏣ __${total - money}__ token is needed to buy it.`)

        const storageAfter = await client.money.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            $inc: {
                balance: -total,
            },
        }, {
            upsert: true,
            new: true,
        });
        const items = quantity < 1 ? item : item + 's';
        const embed = new MessageEmbed()
            .setColor("#bee7f7")
            .setTitle('purchase successful (=^･ω･^=)')
            .setDescription(`you have bought __${quantity}__ of **${items}** (⏣ ${price}) which cost you ⏣ __${total}__ token`)
            .setFooter(`your current balance: ⏣ ${storageAfter.balance}`)
        message.inlineReply(embed)

        if (item === 'wedding ring' || item === 'ring') {
            storage.inventory.rings = storage.inventory.rings + 1
            await storage.save();
        };

        if (item === 'seed') {
            storage.inventory.seeds = storage.inventory.seeds + 1
            await storage.save();
        }

        if (item === 'worm') {
            storage.inventory.seeds = storage.inventory.seeds + 1
            await storage.save();
        }
    };
    if (toBuy === 'wedding ring' || toBuy === 'ring') {
        buyItem(money, 1300, args[0], toBuy)
    };

    if (toBuy === 'seed') {
        buyItem(money, 50, args[0], toBuy)
    };

    if (args[1] === 'worm') {
        buyItem(money, 150, args[0], toBuy)
    };
};

exports.help = {
    name: "buy",
    description: "shows a list of purchasable items.",
    usage: "buy `<amount> <items>`",
    example: "buy `seeds 10`"
};

exports.conf = {
    aliases: ["purchase"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};