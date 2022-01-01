const { MessageEmbed } = require('discord.js')

exports.run = async(client, message, args, prefix) => {
    let garden = await client.garden.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!garden) {
        const model = client.garden;
        garden = new model({
            userId: message.author.id,
            guildId: message.guild.id,
        });
    };
    if (args[0] === '1' || args[0] === '2' || args[0] === '3') {
        let getPlant;
        let getStage;
        if (args[0] === '1') {
            getPlant = garden.plantOne;
            getStage = garden.plantOneStage;
        }
        if (args[0] === '2') {
            getPlant = garden.plantTwo;
            getStage = garden.plantTwoStage;
        }
        if (args[0] === '3') {
            getPlant = garden.plantThree;
            getStage = garden.plantThreeStage;
        };

        if (getStage !== "4") return message.reply(':x: the plant in the slot you choose is not ripe enough to be harvested yet.');
        if (args[0] === '1') {
            await client.garden.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                plantOne: null,
                plantOneStage: '0'
            }, {
                upsert: true,
                new: true,
            });
        }
        if (args[0] === '2') {
            await client.garden.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                plantTwo: null,
                plantTwoStage: '0'
            }, {
                upsert: true,
                new: true,
            });
        }
        if (args[0] === '3') {
            await client.garden.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                plantThree: null,
                plantThreeStage: '0'
            }, {
                upsert: true,
                new: true,
            });
        };
        const names = {
            "hibiscus": "Hibiscus",
            "ear_of_rice": "Ear of Rice",
            "blossom": "Blossom",
            "rose": "Rose",
            "tanabata_tree": "Tanabata Tree",
            "bamboo": "Bamboo",
            "sunflower": "Sunflower",
            "moneybag": "Money Bag",
            "deciduous_tree": "Deciduous Tree",
            "evergreen_tree": "Evergreen Tree",
            "chest": "Chest",
            "palm_tree": "Palm Tree",
            "cactus": "Cactus",
            "skull": "Skull",
            "t_rex": "T Rex",
            "sauropod": "Sauropod"
        }
        var rarity
        if (getPlant === "hibiscus" || getPlant === "ear_of_rice" || getPlant === "blossom" || getPlant === "rose") rarity = "common"
        if (getPlant === "tanabata_tree" || getPlant === "bamboo" || getPlant === "sunflower" || getPlant === "moneybag") rarity = "uncommon"
        if (getPlant === "deciduous_tree" || getPlant === "evergreen_tree" || getPlant === "chest") rarity = "rare"
        if (getPlant === "palm_tree" || getPlant === "cactus") rarity = "very rare"
        if (getPlant === "skull" || getPlant === "bone" || getPlant === "t_rex" || getPlant === "sauropod") rarity = "legendary"

        var worth
        if (rarity === "common") worth = 100
        if (rarity === "uncommon") worth = 200
        if (rarity === "rare") worth = 300
        if (rarity === "very rare") worth = 500
        if (rarity === "legendary") worth = 1000

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
            .setAuthor({name: `🌼 ${message.author.username}'s garden`, iconURL: message.author.displayAvatarURL()})
            .setColor("#bee7f7")
            .setDescription(`you harvested and sold **${rarity}** :${getPlant}: **${names[getPlant]}** that worth ⏣ **${worth}**!`)

        if (getPlant === "chest") {
            const chest = client.customEmojis.get("chest");

            const embed2 = new MessageEmbed()
                .setColor("#bee7f7")
                .setAuthor({name: `🌼 ${message.author.username}'s garden`, iconURL: message.author.displayAvatarURL()})
                .setDescription(`you harvested and sold **${rarity}** ${chest} **${names[getPlant]}** that worth ⏣ **${worth}**!`)
            return message.channel.send({ embeds: [embed2] })
        } else return message.channel.send({ embeds: [embed] })
    } else {
        return message.reply(`:x: you have to specify the garden slot that you want to harvest!`)
    }
};
exports.help = {
    name: "harvest",
    description: "harvest your plant after they grow",
    usage: ["harvest `<slot>`"],
    example: ["harvest `2`"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};