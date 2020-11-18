const Discord = require("discord.js");

module.exports = async (client, message) => {
    let recent = client.recent; // new Set();

    // Ignore the bot.
    if (message.author.bot || message.author === client.user) return;

    // If the user has an exp. cooldown, ignore it.
    if (recent.has(message.author.id)) return;

    let userprof = await client.dbleveling.findOneAndUpdate({
        guildId: message.guild.id,
        userId: message.author.id
    }, {
        guildId: message.guild.id,
        userId: message.author.id,
        $inc: {
            xp: client.leveling.gainedXp()
        }, 
    }, {
        upsert: true,
        new: true,
    })


    // Notice them if the user has leveled/ranked up.
    if (client.leveling.getLevel(userprof.xp) > userprof.level) {
        await client.dbleveling.findOneAndUpdate({
            guildId: message.guild.id,
            userId: message.author.id
        }, {
            guildId: message.guild.id,
            userId: message.author.id,
            $inc: {
                level: 1,
            }, 
        }, {
            upsert: true,
            new: true,
        })
        userprof.level = client.leveling.getLevel(userprof.xp);
        message.reply(`you has reached level **${userprof.level}**! this msg will be deleted in 5 seconds.`).then(m => m.delete({ timeout: 5000 }));
    };

    // Generate a random timer. (2)
    let randomTimer = getRandomInt(80000, 90000); // Around 60 - 75 seconds. You can change it.

    // Add the user into the Set()
    recent.add(message.author.id);

    // Remove the user when it's time to stop the cooldown.
    client.setTimeout(() => {
        recent.delete(message.author.id)
    }, randomTimer);
}

// Generate a random timer.
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
