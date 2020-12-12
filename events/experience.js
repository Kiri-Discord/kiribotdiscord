module.exports = async (client, message) => {
    if (message.author.bot || message.author === client.user) return;

    if (message.channel.type === "dm") return;

    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    }); 
    
    const prefix = setting.prefix;
    const ignorechannel = setting.ignoreLevelingsChannelID;
    const verifychannel = setting.verifyChannelID

    let recent = client.recent; 

    
    // Ignore cmd with prefix
    if(message.content.toLowerCase().startsWith(prefix)) return;
    //ignore ignore channel
    if (ignorechannel && message.channel.id === ignorechannel) return;
    if (verifychannel && message.channel.id === verifychannel) return;
    

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
        message.reply(`you has reached level **${userprof.level}**! i will disappear from this convo in a sec..`).then(m => m.delete({ timeout: 5000 })).catch(() => {
            message.author.send(`you has reached level **${userprof.level}** in **${message.guild.name}**!\ni send you this via DM since i don't have the perm to notify you via the channel you're chatting :(`).catch(() => {
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
