exports.run = async (client, message, args, prefix) => {
    return message.channel.send({embed: {color: "f3f3f3", description: `ℹ️ my current guild prefix here is \`${prefix}\` you can also use mention as a prefix too!\n\nto change my prefix, do \`${prefix}set-prefix <prefix>\` !`}});
};

exports.help = {
    name: "prefix",
    description: "Display server-configurated prefix.",
    usage: "prefix",
    example: "prefix"
};

exports.conf = {
    aliases: ["pre"],
    cooldown: 2,
    channelPerms: ["EMBED_LINKS"]
};