exports.run = async(client, message, args, prefix) => {
    return message.channel.send({
        embeds: [{
            color: "f3f3f3",
            description: `ℹ️ my current guild prefix here is \`${prefix}\` you can also use mention as a prefix too!\n\nto change my prefix, do \`${prefix}set-prefix <prefix>\` !`
        }]
    });
};

exports.help = {
    name: "prefix",
    description: "display my current prefix in the server.",
    usage: "prefix",
    example: "prefix"
};

exports.conf = {
    aliases: [],
    cooldown: 2,
    channelPerms: ["EMBED_LINKS"]
};