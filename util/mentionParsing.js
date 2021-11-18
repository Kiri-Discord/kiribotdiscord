module.exports = class mentionParsing {
    static parseMember(message, string) {
        if (!string) return;
        const id = string.replace(/[<>@!]/g, "");
        const member = message.mentions.members.get(id) || message.guild.members.cache.get(id);
        if (!member) return;
        return member;
    };
};