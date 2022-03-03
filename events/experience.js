const varReplace = require('../util/variableReplace');
const { deleteIfAble } = require('../util/util');

module.exports = async(client, message, setting) => {
    let prefix = setting.prefix;

    const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);

    const ignorechannel = setting.ignoreLevelingsChannelID;

    if (prefixRegex.test(message.content)) return;
    if (ignorechannel && message.channel.id === ignorechannel) return;
    if (message.content.match(prefixRegex)) return;

    let recent = client.recent;
    if (recent.has(message.author.id)) return;

    let userprof = await client.db.leveling.findOneAndUpdate({
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
    });


    if (client.leveling.getLevel(userprof.xp) > userprof.level) {
        await client.db.leveling.findOneAndUpdate({
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
        const level = client.leveling.getLevel(userprof.xp);
        let channel;
        let levelMessage;
        if (!setting.levelings.destination) channel = message.channel;
        else channel = message.guild.channels.cache.get(setting.levelings.destination);
        if (!channel || !channel.viewable || !channel.permissionsFor(message.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return;
        if (setting.levelings.content.type === 'plain') levelMessage = await channel.send(varReplace.replaceText(setting.levelings.content.content, message.member, message.guild, { event: 'level', type: setting.responseType }, { level, xp: userprof.xp }));
        else levelMessage = await channel.send({ embeds: [varReplace.replaceEmbed(setting.levelings.content.content.embed, message.member, message.guild, { event: 'level', type: setting.responseType }, { level, xp: userprof.xp })] });
        if (channel.id === message.channel.id) {
            setTimeout(() => {
                deleteIfAble(levelMessage);
            }, 5000);
        };
        const existingLevelReward = await client.db.levelingRewards.find({ 
            guildId: message.guild.id, 
            level: {
                $lte: level
            }
        }).sort([
            ["level", "descending"]
        ]);
        if (existingLevelReward.length) {
            const reward = existingLevelReward[0];
            if (message.member._roles.includes(reward.roleId)) return;
            const role = message.guild.roles.cache.get(reward.roleId);
            if (!role) {
                await client.db.levelingRewards.deleteMany({
                    roleId: reward.roleId,
                    guildId: message.guild.id
                });
            } else {
                if (!role.editable || !message.member.manageable) return;
                await message.member.roles.add(role);
            }
        }
    };

    let randomTimer = getRandomInt(65000, 80000); 
    recent.add(message.author.id);
    setTimeout(() => {
        recent.delete(message.author.id)
    }, randomTimer);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}