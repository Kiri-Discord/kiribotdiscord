const varReplace = require('../../util/variableReplace');

module.exports = async(client, member) => {
    if (member.user.bot) return;

    const setting = await client.dbFuncs.existingGuild(member.guild.id);
    if (!setting) return;
    if (setting.greetChannelID) {
        const channel = member.guild.channels.cache.get(setting.greetChannelID);
        if (!channel || !channel.viewable || !channel.permissionsFor(member.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return;
        if (setting.greetContent.type === 'plain') return channel.send(varReplace.replaceText(setting.greetContent.content, member, member.guild, { event: 'join', type: setting.responseType }));
        else return channel.send({ embeds: [varReplace.replaceEmbed(setting.greetContent.content.embed, member, member.guild, { event: 'join', type: setting.responseType })]});
    };
};