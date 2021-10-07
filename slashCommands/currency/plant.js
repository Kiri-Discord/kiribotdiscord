const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const slot = interaction.options.getString('slot');
    await interaction.deferReply();
    let storage = await client.inventory.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!storage) {
        const model = client.inventory
        storage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
    };
    if (storage.seeds < 1) return interaction.editReply(`:x: you don't have enough 🌱 **seeds** in your inventory to plant in your garden! buy one at \`/shop\`!`);

    if (slot === '1' || slot === '2' || slot === '3') {
        var d = Math.random();
        let plant;
        if (d < 0.5) {
            const choices = ["hibiscus", "ear_of_rice", "blossom", "rose"];

            const random = Math.floor(Math.random() * choices.length);
            plant = choices[random];
        } else if (d < 0.75) {
            const choices = ["tanabata_tree", "bamboo", "sunflower", "moneybag"];

            const random = Math.floor(Math.random() * choices.length);
            plant = choices[random];
        } else if (d < 0.9) {
            const choices = ["deciduous_tree", "evergreen_tree", "chest"];

            const random = Math.floor(Math.random() * choices.length);
            plant = choices[random];
        } else if (d < 0.98) {
            const choices = ["palm_tree", "cactus"];

            const random = Math.floor(Math.random() * choices.length);
            plant = choices[random];
        } else {
            const choices = ["bone", "skull", "t_rex", "sauropod"];

            const random = Math.floor(Math.random() * choices.length);
            plant = choices[random];
        };
        if (slot === '1') {
            await client.garden.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                plantOne: plant,
                plantOneStage: '1'
            }, {
                upsert: true,
                new: true,
            });
        } else if (slot === '2') {
            await client.garden.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                plantTwo: plant,
                plantTwoStage: '1'
            }, {
                upsert: true,
                new: true,
            });
        } else if (slot === '3') {
            await client.garden.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                plantThree: plant,
                plantThreeStage: '1'
            }, {
                upsert: true,
                new: true,
            });
        };
        await client.inventory.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            $inc: {
                seeds: -1,
            },
        }, {
            upsert: true,
            new: true,
        });
        const embed = new MessageEmbed()
            .setAuthor(`🌼 ${interaction.user.username}'s garden`, interaction.user.displayAvatarURL())
            .setColor("#bee7f7")
            .setDescription(`you have planted seed on slot \`${slot}\``)
            .setFooter(`seeds can be grown to tree by watering via /water!`)
        return interaction.editReply({ embeds: [embed] })
    } else {
        return interaction.editReply(`:seedling: you need to specify which slot you want to plant the seed in (1-3).`)
    };
};

exports.help = {
    name: "plant",
    description: "plant seeds in your garden.",
    usage: ["plant `<slot>`"],
    example: ["plant `2`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('slot')
            .setDescription('what is the garden slot that you want to plant?')
            .addChoice('1', '1')
            .addChoice('2', '2')
            .addChoice('3', '3')
            .setRequired(true)
        ),
    cooldown: 5,
    guild: true,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};