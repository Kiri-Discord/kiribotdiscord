const ms = require("ms");
exports.run = async(client, message, args, prefix) => {
    const db = client.guildsStorage.get(message.guild.id);
    let time = args.join(" ");

    if (!time) return message.inlineReply("please includes the time format. all valid time format are \`s, m, hrs\`!");

    let convert = ms(time);
    let toSecond = Math.floor(convert / 1000);

    if (!toSecond || toSecond == undefined) return message.inlineReply("please insert the valid time format! all valid time format are \`s, m, hrs\`!");

    if (toSecond > 21600 || toSecond < 1) return message.inlineReply("the timer should be more than or equal to 1 second or less than 6 hours!");
    db.verifyTimeout = convert;
    await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            verifyTimeout: convert
        })
        .catch(err => console.error(err));
    return message.channel.send({ embed: { color: "f3f3f3", description: `☑️ new member will be kicked in **${ms(ms(time), {long: true})}** if not verify. if you can't get it working, use \`${prefix}setverify\` first!` } });
}
exports.help = {
    name: "setverifytimeout",
    description: "how long do you want unverified people to stay in your guild?",
    usage: "setverifytimeout <time>",
    example: ["setverify `5hrs`", "setverify `10m`"]
};

exports.conf = {
    aliases: ["verifytimeout"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};