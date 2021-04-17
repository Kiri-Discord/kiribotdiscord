module.exports = async client => {
    async function getUserfromMention(mention) {
        if (!mention) return;
        const id = mention.replace(/[<>@!]/g, "")
        const user = await client.users.cache.get(id);
        return user;
    }
    global.getUserfromMention = getUserfromMention;
}