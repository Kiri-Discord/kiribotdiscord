module.exports = async(client, message, setting) => {
    if (message.channel.type === "dm") return;

    let prefix = setting.prefix;

    const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);

    const ignorechannel = setting.ignoreLevelingsChannelID;
    const verifychannel = setting.verifyChannelID;

    if (prefixRegex.test(message.content)) return;
    if (ignorechannel && message.channel.id === ignorechannel) return;
    if (verifychannel && message.channel.id === verifychannel) return;
    if (message.content.match(prefixRegex)) return;

    let recent = client.recent;
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


    if (client.leveling.getLevel(userprof.xp) > userprof.level) {
        client.dbleveling.findOneAndUpdate({
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
        message.channel.send(`**${message.author.username}**, you have reached level **${userprof.level}**! i will disappear from this convo in a sec..`).then(m => m.delete({ timeout: 5000 })).catch(() => {
            message.author.send(`you have reached level **${userprof.level}** in **${message.guild.name}**!\ni send you this via DM since i don't have the perm to notify you via the channel you're chatting :(`).catch(() => {
                return;
            })
        });
    };

    let randomTimer = getRandomInt(65000, 80000);
    recent.add(message.author.id);
    client.setTimeout(() => {
        recent.delete(message.author.id)
    }, randomTimer);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}