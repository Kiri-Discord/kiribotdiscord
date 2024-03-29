exports.run = async(client, message, args, prefix) => {
    let garden = await client.db.garden.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!garden) {
        const model = client.db.garden;
        garden = new model({
            userId: message.author.id,
            guildId: message.guild.id,
        });
    };
    let cooldownStorage = await client.db.cooldowns.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!cooldownStorage) {
        const model = client.db.cooldowns
        cooldownStorage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
        await cooldownStorage.save();
    };

    const cooldown = 8.64e+7;
    const lastWater = cooldownStorage.lastWater;
    const p1 = garden.plantOne;
    const p2 = garden.plantTwo;
    const p3 = garden.plantThree;
    if (!p1 && !p2 && !p3) return message.reply(`:x: you don't have any plants to water :pensive: check \`${prefix}shop\` to buy some!`);
    const timeLeft = cooldown - (Date.now() - lastWater);
    if (lastWater !== null && timeLeft > 0) return message.reply(`💦 you just watered your plant today! you can water it again <t:${Math.floor((Date.now() + timeLeft) / 1000)}:R>!`);
    var s1 = garden.plantOneStage;
    var s2 = garden.plantTwoStage;
    var s3 = garden.plantThreeStage;

    if (s1 === "1") {
        s1 = "2";
        await client.db.garden.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            plantOneStage: s1
        }, {
            upsert: true,
            new: true,
        });
    } else if (s1 === "2") {
        s1 = "3";
        await client.db.garden.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            plantOneStage: s1
        }, {
            upsert: true,
            new: true,
        });
    } else if (s1 === "3") {
        s1 = "4"
        await client.db.garden.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            plantOneStage: s1
        }, {
            upsert: true,
            new: true,
        });
    };

    if (s2 === "1") {
        s2 = "2";
        await client.db.garden.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            plantTwoStage: s2
        }, {
            upsert: true,
            new: true,
        });
    } else if (s2 === "2") {
        s2 = "3";
        await client.db.garden.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            plantTwoStage: s2
        }, {
            upsert: true,
            new: true,
        });
    } else if (s2 === "3") {
        s2 = "4";
        await client.db.garden.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            plantTwoStage: s2
        }, {
            upsert: true,
            new: true,
        });
    };

    if (s3 === "1") {
        s3 = "2";
        await client.db.garden.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            plantThreeStage: s3
        }, {
            upsert: true,
            new: true,
        });
    } else if (s3 === "2") {
        s3 = "3";
        await client.db.garden.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            plantThreeStage: s3
        }, {
            upsert: true,
            new: true,
        });
    } else if (s3 === "3") {
        s3 = "4";
        await client.db.garden.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            plantThreeStage: s3
        }, {
            upsert: true,
            new: true,
        });
    };
    await client.db.cooldowns.findOneAndUpdate({
        guildId: message.guild.id,
        userId: message.author.id
    }, {
        guildId: message.guild.id,
        userId: message.author.id,
        lastWater: Date.now()
    }, {
        upsert: true,
        new: true,
    });
    return message.reply(`💦 your plant was watered! check \`${prefix}garden\` to watch the progress or \`${prefix}harvest\` to collect the weed!`)
};
exports.help = {
    name: "water",
    description: "water your tree in the garden",
    usage: ["water"],
    example: ["water"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: []
};