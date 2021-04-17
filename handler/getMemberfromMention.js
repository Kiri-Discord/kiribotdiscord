module.exports = async () => {
    async function getMemberfromMention(mention, guild) {
        if (!mention) return;
        const id = mention.replace(/[<>@!]/g, "");
        const member = await guild.members.cache.get(id);
        return member;
    }
    global.getMemberfromMention = getMemberfromMention;
}