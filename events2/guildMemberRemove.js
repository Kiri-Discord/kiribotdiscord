const { purgeDbUser } = require('../util/util');
const varReplace = require('../util/variableReplace');

module.exports = async(client, member) => {
    await purgeDbUser(client, member.guild.id, member.user.id);
    if (member.user.bot) return;
    const setting = await client.db.guilds.findOne({
        guildID: member.guild.id
    });
    if (!setting) return;
    if (setting.byeChannelID) {
        const channel = member.guild.channels.cache.get(setting.byeChannelID);
        if (!channel || !channel.viewable || !channel.permissionsFor(member.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return;
        if (setting.byeContent.type === 'plain') return channel.send(varReplace.replaceText(setting.byeContent.content, member, member.guild, { event: 'leave', type: setting.responseType }));
        else return channel.send({ embeds: [varReplace.replaceEmbed(setting.byeContent.content.embed, member, member.guild, { event: 'leave', type: setting.responseType })] });
    };
};