const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const slot = interaction.options.getString('slot');
    await interaction.deferReply();
    let garden = await client.garden.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!garden) {
        const model = client.garden;
        garden = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        });
    };
    if (slot === '1' || slot === '2' || slot === '3') {
        let getPlant;
        let getStage;
        if (slot === '1') {
            getPlant = garden.plantOne;
            getStage = garden.plantOneStage;
        }
        if (slot === '2') {
            getPlant = garden.plantTwo;
            getStage = garden.plantTwoStage;
        }
        if (slot === '3') {
            getPlant = garden.plantThree;
            getStage = garden.plantThreeStage;
        };

        if (getStage !== "4") return interaction.editReply(':x: the plant in the slot you choose is not ripe enough to be harvested yet.');
        if (slot === '1') {
            await client.garden.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                plantOne: null,
                plantOneStage: '0'
            }, {
                upsert: true,
                new: true,
            });
        }
        if (slot === '2') {
            await client.garden.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                plantTwo: null,
                plantTwoStage: '0'
            }, {
                upsert: true,
                new: true,
            });
        }
        if (slot === '3') {
            await client.garden.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
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
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            $inc: {
                balance: worth,
            },
        }, {
            upsert: true,
            new: true,
        });

        const embed = new MessageEmbed()
            .setAuthor(`🌼 ${interaction.user.username}'s garden`, interaction.user.displayAvatarURL())
            .setColor("#bee7f7")
            .setDescription(`you harvested and sold **${rarity}** :${getPlant}: **${names[getPlant]}** that worth ⏣ **${worth}**!`)

        if (getPlant === "chest") {
            const chest = client.customEmojis.get("chest");

            const embed2 = new MessageEmbed()
                .setColor("#bee7f7")
                .setAuthor(`🌼 ${interaction.user.username}'s garden`, interaction.user.displayAvatarURL())
                .setDescription(`you harvested and sold **${rarity}** ${chest} **${names[getPlant]}** that worth ⏣ **${worth}**!`)
            return interaction.editReply({ embeds: [embed2] })
        } else return interaction.editReply({ embeds: [embed] })
    } else {
        return interaction.editReply(`:x: you have to specify the garden slot that you want to harvest!`);
    };
};
exports.help = {
    name: "harvest",
    description: "harvest your plant after they grow",
    usage: ["harvest `<slot>`"],
    example: ["harvest `2`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('slot')
            .setDescription('what is the garden slot that you want to harvest?')
            .addChoice('1', '1')
            .addChoice('2', '2')
            .addChoice('3', '3')
            .setRequired(true)
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};