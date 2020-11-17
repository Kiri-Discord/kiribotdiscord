const Discord = require("discord.js");

module.exports = async (client, message) => {
    let recent = client.recent; // new Set();

    // Ignore the bot.
    if (message.author.bot || message.author === client.user) return;

    // If the user has an exp. cooldown, ignore it.
    if (recent.has(message.author.id)) return;

    let userprof = await client.dbleveling.findOne({
        guildId: message.guild.id,
        userId: message.author.id
    }, (err, guild) => {
        if (err) console.error(err)
        if (!guild) {
            const newuserprof = new client.dbleveling({
                guildId: message.guild.id,
                userId: message.author.id,
                level: 0,
                xp: client.leveling.gainedXp()
            })
            newuserprof.save().catch(err => console.error(err))

        }

    });

    await userprof.updateOne({
        $inc: {
            xp: client.leveling.gainedXp()
        }, 
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
        message.reply(`you are slowly escaping from being a introvert here in this guild and has reached level **${userprof.level} :D i don't have a leaderboard yet, maybe that's what i will be implemented in the future 😉\n*hopefully***`).then(m => m.delete({ timeout: 5000 }));
    };

    // Generate a random timer. (2)
    let randomTimer = getRandomInt(10, 20); // Around 60 - 75 seconds. You can change it.

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