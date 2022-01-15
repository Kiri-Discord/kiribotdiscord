const { MessageEmbed } = require('discord.js');
const list = require('../../assets/items.json');

exports.run = async(client, message, args, prefix) => {
    if (!args[0]) return message.reply(`how many items do you want to buy? please check \`${prefix}help buy\` if you encounter any problem :grin:`);

    function isInt(value) {
        if (isNaN(value)) {
            return false;
        }
        var x = parseFloat(value);
        return (x | 0) === x;
    };

    if (isNaN(args[0]) || !isInt(args[0]) || Math.sign(args[0]) === -1) return message.reply('that isn\'t a vaild number! can you try again? :pensive:')
    const items = Object.keys(list);
    const toBuy = args.slice(1).join(' ');
    if (!toBuy) return message.reply(`what item do you want to buy? for a list of item that you can purchase, please check \`${prefix}shop\` <3`)
    if (!items.includes(toBuy)) return message.reply(`\`${toBuy}\` is an invalid item! check \`${prefix}shop\` for a list of avaliable item :grin:`);

    let moneyStorage = await client.money.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!moneyStorage) {
        const model = client.money
        moneyStorage = new model({
            userId: message.author.id,
            guildId: message.guild.id,
        });
    };
    const money = moneyStorage.balance;

    async function buyItem(money, price, quantity, item) {
        const total = price * quantity;
        if (money < total) return message.reply(`you don't have that much money in your balance :pensive:\na total of ⏣ __${total - money}__ token is needed to buy it.`)
        const items = quantity < 1 ? list[item].displayName : list[item].displayName + 's';
        const embed = new MessageEmbed()
            .setColor("#bee7f7")
            .setAuthor({name: 'purchase successful (=^･ω･^=)', iconURL: message.author.displayAvatarURL()})
            .setDescription(`you have bought __${quantity}__ **${items}** (⏣ ${price}) which cost you ⏣ __${total}__ token`)
            .setFooter({text: `your current balance: ⏣ ${money - total}`})

        if (item === 'rings') {
            await client.inventory.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
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
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                $inc: {
                    seeds: quantity,
                },
            }, {
                upsert: true,
                new: true,
            });
        }

        if (item === 'worms') {
            await client.inventory.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
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
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
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
        return message.reply({ embeds: [embed] });
    };
    if (toBuy === 'rings') {
        buyItem(money, 1300, args[0], toBuy)
    };

    if (toBuy === 'seeds') {
        buyItem(money, 50, args[0], toBuy)
    };

    if (toBuy === 'worms') {
        buyItem(money, 150, args[0], toBuy)
    };

    if (toBuy === 'eqTicket') {
        buyItem(money, 500, args[0], toBuy)
    };
};

exports.help = {
    name: "buy",
    description: "buy an item from the store",
    usage: ["buy `<amount> <items>`"],
    example: ["buy `seeds 10`"]
};

exports.conf = {
    aliases: ["purchase"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};