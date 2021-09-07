const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');
const varReplace = require('../util/variableReplace');

module.exports = async(client, member) => {
    await client.dbleveling.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });

    await client.dbverify.findOneAndDelete({
        guildID: member.guild.id,
        userID: member.user.id,
    });
    await client.cooldowns.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });
    await client.inventory.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });
    await hugSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await punchSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await slapSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await cuddleSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await kissSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await patSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await client.verifytimers.deleteTimer(member.guild.id, member.user.id);
    const setting = await client.dbguilds.findOne({
        guildID: member.guild.id
    });
    if (setting.byeChannelID) {
        const channel = member.guild.channels.cache.get(setting.byeChannelID);
        if (!channel || !channel.permissionsFor(member.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return;
        if (setting.byeContent.type === 'plain') return channel.send(varReplace.replaceText(setting.byeContent.content, member, member.guild, { event: 'leave', type: setting.responseType }));
        else return channel.send({ embed: varReplace.replaceEmbed(setting.byeContent.content.embed, member, member.guild, { event: 'leave', type: setting.responseType }) });
    };
};