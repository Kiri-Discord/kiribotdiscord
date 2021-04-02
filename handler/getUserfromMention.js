module.exports = async client => {
    async function getUserfromMention(mention) {
        if (!mention) return;
        const matches = mention.match(/^<@!?(\d+)>$/);
        if (!matches) return;
        const id = matches[1];
        const user = await client.users.cache.get(id);
        return user;
    }
    global.getUserfromMention = getUserfromMention;
}