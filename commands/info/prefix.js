exports.run = async(client, message, args, prefix) => {
    return message.channel.send({
        embeds: [{
            color: "#bee7f7",
            description: `ℹ️ my current guild prefix here is \`${prefix}\` you can also use mention as a prefix too!\n\nto change my prefix, do \`${prefix}set-prefix <prefix>\` !`,
            footer: {
                text: 'slash command are also avaliable! feel free to check them out!'
            }
        }]
    });
};

exports.help = {
    name: "prefix",
    description: "display my server-configurated prefix.",
    usage: ["prefix"],
    example: ["prefix"]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
    channelPerms: ["EMBED_LINKS"]
};