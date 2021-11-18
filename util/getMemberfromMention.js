module.exports = (message, string) => {
    if (!string) return;
    const id = string.replace(/[<>@!]/g, "");
    const member = message.mentions.members.get(id);
    if (!member) return;
    return member;
}