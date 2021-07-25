const humanizeDuration = require("humanize-duration");

exports.run = async(client, message, args, prefix) => {
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
    const cooldown = 8.64e+7;
    const lastWater = storage.lastWater;
    if (lastWater !== null && cooldown - (Date.now() - lastWater) > 0) return message.inlineReply(`💦 you just watered your plant today! you can water it again in **${humanizeDuration(cooldown - (Date.now() - lastWater))}**!`);
    const p1 = storage.garden.plant1;
    const p2 = storage.garden.plant2;
    const p3 = storage.garden.plant3;
    if (!p1 && !p2 && !p3) return message.inlineReply(`:x: you don't have any plants to water :pensive: check \`${prefix}shop\` to buy some!`);
    var s1 = storage.garden.plant1Stage;
    var s2 = storage.garden.plant2Stage;
    var s3 = storage.garden.plant3Stage;

    if (s1 === "1") {
        s1 = "2";
        storage.garden.plant1Stage = s1;
    } else if (s1 === "2") {
        s1 = "3";
        storage.garden.plant1Stage = s1;
    } else if (s1 === "3") {
        s1 = "4"
        storage.garden.plant1Stage = s1;
    };

    if (s2 === "1") {
        s2 = "2";
        storage.garden.plant2Stage = s2;
    } else if (s2 === "2") {
        s2 = "3";
        storage.garden.plant2Stage = s2;
    } else if (s2 === "3") {
        s2 = "4";
        storage.garden.plant2Stage = s2;
    };

    if (s3 === "1") {
        s3 = "2";
        storage.garden.plant3Stage = s3;
    } else if (s3 === "2") {
        s3 = "3";
        storage.garden.plant3Stage = s3;
    } else if (s3 === "3") {
        s3 = "4";
        storage.garden.plant3Stage = s3;
    };
    await storage.save();
    return message.inlineReply(`💦 your plant was watered! check \`${prefix}garden\` to watch the progress or \`${prefix}harvest\` to collect the weed!`)
};
exports.help = {
    name: "water",
    description: "water your tree in the garden",
    usage: "water",
    example: "water"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};