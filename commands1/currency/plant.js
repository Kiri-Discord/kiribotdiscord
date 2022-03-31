const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args, prefix) => {
    let storage = await client.db.inventory.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!storage) {
        const model = client.db.inventory
        storage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
    };
    if (storage.seeds < 1) return message.reply(`:x: you don't have enough 🌱 **seeds** in your inventory to plant in your garden! buy one at \`${prefix}shop\`!`);

    if (args[0] === '1' || args[0] === '2' || args[0] === '3') {
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
        if (args[0] === '1') {
            await client.db.garden.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                plantOne: plant,
                plantOneStage: '1'
            }, {
                upsert: true,
                new: true,
            });
        } else if (args[0] === '2') {
            await client.db.garden.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                plantTwo: plant,
                plantTwoStage: '1'
            }, {
                upsert: true,
                new: true,
            });
        } else if (args[0] === '3') {
            await client.db.garden.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                plantThree: plant,
                plantThreeStage: '1'
            }, {
                upsert: true,
                new: true,
            });
        };
        await client.db.inventory.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            $inc: {
                seeds: -1,
            },
        }, {
            upsert: true,
            new: true,
        });
        const embed = new MessageEmbed()
            .setAuthor({name: `🌼 ${message.author.username}'s garden`, iconURL: message.author.displayAvatarURL()})
            .setColor("#bee7f7")
            .setDescription(`you have planted seed on slot \`${args[0]}\``)
            .setFooter({text: `seeds can be grown to tree by watering via ${prefix}water!`})
        return message.reply({ embeds: [embed] })
    } else {
        return message.reply(`:seedling: you need to specify which slot you want to plant the seed in (1-3).`)
    }
}

exports.help = {
    name: "plant",
    description: "plant seeds in your garden.",
    usage: ["plant `<slot>`"],
    example: ["plant `2`"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};