const ms = require("ms");
exports.run = async(client, message, args, prefix) => {
    const db = client.guildsStorage.get(message.guild.id);
    if (message.flags[0] === "off") {
        db.verifyTimeout = undefined;
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            verifyTimeout: null
        });
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ verify timeout has been disabled` }] });
    };
    let time = args.join(" ");

    if (!time) return message.reply("please includes the time format. all valid time format are \`s, m, hrs\`!");

    let convert = ms(time);
    let toSecond = Math.floor(convert / 1000);

    if (!toSecond) return message.reply("please insert the valid time format! all valid time format are \`s, m, hrs\`!");

    if (toSecond > 21600 || toSecond < 60) return message.reply("the timer should be more than or equal to 1 minute or less than 6 hours!");
    try {
        db.verifyTimeout = convert;
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            verifyTimeout: convert
        });
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ new member will be kicked in **${ms(ms(time), {long: true})}** if not verifying. if you can't get it working, use \`${prefix}set-verify\` first!` }] });
    } catch {
        logger.log('error', err);
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there was a problem when i was trying to save that! can you try again later?` }] })
    };

}
exports.help = {
    name: "setverifytimeout",
    description: "set the timeout duration that allow unverified members to stay and verify themselves before they are kicked.",
    usage: ["setverifytimeout `<time>`", "setverifytimeout `-off`"],
    example: ["setverifytimeout `5hrs`", "setverifytimeout `10m`", "setverifytimeout `-off`"]
};

exports.conf = {
    aliases: ["verifytimeout"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};