const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    let storage = await client.inventory.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!storage) {
        const model = client.inventory
        storage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
        await storage.save();
    };
    if (storage.worms < 0) return message.inlineReply(`:x: you don't have enough 🪱 **worms** in your inventory to plant in your garden! buy one at \`${prefix}shop\`!`);
    var d = 0
    d = Math.random()

    let fish;
    if (d < 0.67) {
        const choices = ["fish", "nothing"];

        const random = Math.floor(Math.random() * choices.length);
        fish = choices[random];
    } else if (d < 0.8) {
        const choices = ["tropical_fish", "blowfish", "lobster", "moneybag", "crab"];

        const random = Math.floor(Math.random() * choices.length);
        fish = choices[random];
    } else if (d < 0.95) {
        const choices = ["frog", "chest", "octopus", "squid"];

        const random = Math.floor(Math.random() * choices.length);
        fish = choices[random];
    } else if (d < 0.98) {
        const choices = ["seal", "dolphin", "turtle", ];

        const random = Math.floor(Math.random() * choices.length);
        fish = choices[random];
    } else if (d < 0.99) {
        const choices = ["person_surfing", "clownfish", "whale2", "merperson"];

        const random = Math.floor(Math.random() * choices.length);
        fish = choices[random];
    };


    var rarity
    if (fish === "fish") rarity = "common"
    if (fish === "tropical_fish" || fish === "blowfish" || fish === "lobster" || fish === "octopus" || fish === "moneybag" || fish === "crab") rarity = "uncommon"
    if (fish === "squid" || fish === "octopus" || fish === "chest" || fish === "frog") rarity = "rare"
    if (fish === "seal" || fish === "dolphin" || fish === "turtle") rarity = "very rare"
    if (fish === "person_surfing" || fish === "clownfish" || fish === "whale2" || fish === "merperson") rarity = "legendary"

    const names = {
        "fish": "Fish",
        "tropical_fish": "Tropical Fish",
        "blowfish": "Blowfish",
        "lobster": "Lobster",
        "octopus": "Octopus",
        "moneybag": "Money Bag",
        "crab": "Crab",
        "squid": "Squid",
        "octopus": "Octopus",
        "chest": "Chest",
        "frog": "Frog",
        "seal": "Seal",
        "dolphin": "Dolphin",
        "turtle": "Turtle",
        "person_surfing": "Person Surfing",
        "clownfish": "Clownfish",
        "whale2": "Whale",
        "merperson": "Mermaid"
    }

    var worth
    if (fish === "nothing") {
        rarity = "common"
        worth = 0
    }
    if (rarity === "common") worth = 25
    if (rarity === "uncommon") worth = 50
    if (rarity === "rare") worth = 100
    if (rarity === "very rare") worth = 250
    if (rarity === "legendary") worth = 500

    await client.inventory.findOneAndUpdate({
        guildId: message.guild.id,
        userId: message.author.id
    }, {
        guildId: message.guild.id,
        userId: message.author.id,
        $inc: {
            worms: -1,
        },
    }, {
        upsert: true,
        new: true,
    });

    await client.money.findOneAndUpdate({
        guildId: message.guild.id,
        userId: message.author.id
    }, {
        guildId: message.guild.id,
        userId: message.author.id,
        $inc: {
            balance: worth,
        },
    }, {
        upsert: true,
        new: true,
    });

    const embed = new MessageEmbed()
        .setAuthor(`🎣 ${message.author.username} went fishing!`, message.author.displayAvatarURL())
        .setColor("#bee7f7")
        .setDescription(`you caught a **${rarity}** :${fish}: **${names[fish]}** that worth ⏣ **${worth}**!`)

    if (fish === "clownfish") {
        const nemo = client.emojis.cache.get("827417100233998357");

        const embed2 = new MessageEmbed()
            .setAuthor(`🎣 ${message.author.username} went fishing!`, message.author.displayAvatarURL())
            .setColor("#bee7f7")
            .setDescription(`you caught a **${rarity}** ${nemo} **Nemo** that worth ⏣ **${worth}**!`)
        return message.channel.send(embed2)
    } else if (fish === "chest") {
        const chest = client.customEmojis.get("chest");

        const embed2 = new MessageEmbed()
            .setAuthor(`🎣 ${message.author.username} went fishing!`, message.author.displayAvatarURL())
            .setColor("#bee7f7")
            .setDescription(`you found a **${rarity}** **Chest** that worth ⏣ **${worth}**!`)
        return message.channel.send(embed2)
    } else if (fish === "nothing") {
        const embed2 = new MessageEmbed()
            .setAuthor(`🎣 ${message.author.username} went fishing!`, message.author.displayAvatarURL())
            .setColor("#bee7f7")
            .setDescription(`you really did found **NOTHING**! take a deep breath, grind, and try again :pensive:`)
        return message.channel.send(embed2)
    } else return message.channel.send(embed)
}
exports.help = {
    name: "fish",
    description: "go fishing :tropical_fish:",
    usage: "fish",
    example: "fish"
}

exports.conf = {
    aliases: ["fishing"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}
