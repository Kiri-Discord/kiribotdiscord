module.exports = async () => {
    async function getMemberfromMention(mention, guild) {
        if (!mention) return;
        const id = mention.replace(/[<>@!]/g, "");
        const member = guild.members.cache.get(id);
        if (member.partial) await member.fetch();
        return member;
    }
    global.getMemberfromMention = getMemberfromMention;
}