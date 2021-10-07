const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
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
    let cooldownStorage = await client.cooldowns.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!cooldownStorage) {
        const model = client.cooldowns
        cooldownStorage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
        await cooldownStorage.save();
    };

    const cooldown = 8.64e+7;
    const lastWater = cooldownStorage.lastWater;
    const p1 = garden.plantOne;
    const p2 = garden.plantTwo;
    const p3 = garden.plantThree;
    if (!p1 && !p2 && !p3) return interaction.editReply(`:x: you don't have any plants to water :pensive: check \`/shop\` to buy some!`);
    const timeLeft = cooldown - (Date.now() - lastWater);
    if (lastWater !== null && timeLeft > 0) return interaction.editReply(`💦 you just watered your plant today! you can water it again <t:${Math.floor((Date.now() + timeLeft) / 1000)}:R>!`);
    var s1 = garden.plantOneStage;
    var s2 = garden.plantTwoStage;
    var s3 = garden.plantThreeStage;

    if (s1 === "1") {
        s1 = "2";
        await client.garden.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            plantOneStage: s1
        }, {
            upsert: true,
            new: true,
        });
    } else if (s1 === "2") {
        s1 = "3";
        await client.garden.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            plantOneStage: s1
        }, {
            upsert: true,
            new: true,
        });
    } else if (s1 === "3") {
        s1 = "4"
        await client.garden.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            plantOneStage: s1
        }, {
            upsert: true,
            new: true,
        });
    };

    if (s2 === "1") {
        s2 = "2";
        await client.garden.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            plantTwoStage: s2
        }, {
            upsert: true,
            new: true,
        });
    } else if (s2 === "2") {
        s2 = "3";
        await client.garden.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            plantTwoStage: s2
        }, {
            upsert: true,
            new: true,
        });
    } else if (s2 === "3") {
        s2 = "4";
        await client.garden.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            plantTwoStage: s2
        }, {
            upsert: true,
            new: true,
        });
    };

    if (s3 === "1") {
        s3 = "2";
        await client.garden.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            plantThreeStage: s3
        }, {
            upsert: true,
            new: true,
        });
    } else if (s3 === "2") {
        s3 = "3";
        await client.garden.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            plantThreeStage: s3
        }, {
            upsert: true,
            new: true,
        });
    } else if (s3 === "3") {
        s3 = "4";
        await client.garden.findOneAndUpdate({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        }, {
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            plantThreeStage: s3
        }, {
            upsert: true,
            new: true,
        });
    };
    await client.cooldowns.findOneAndUpdate({
        guildId: interaction.guild.id,
        userId: interaction.user.id
    }, {
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        lastWater: Date.now()
    }, {
        upsert: true,
        new: true,
    });
    return interaction.editReply(`💦 your plant was watered! check \`/garden\` to watch the progress or \`/harvest\` to collect the weed!`)
};
exports.help = {
    name: "water",
    description: "water your tree in the garden",
    usage: ["water"],
    example: ["water"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    guild: true,
    cooldown: 3,
    guildOnly: true,
    channelPerms: []
};