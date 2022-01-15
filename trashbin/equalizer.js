const { canModifyQueue } = require("../../util/musicutil");
const types = ['bass', 'pop', 'soft', 'treblebass'];
const eq = require('../../assets/equalizer');

exports.run = async(client, message, args, prefix) => {
    if (!args.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `what equalizer type would you want to apply? you can choose from (${types.join(", ")})` }] });
    if (!types.includes(args[0].toLowerCase())) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `\`${args[0]}\` is a wrong preset :pensive: you can choose those type (${types.join(", ")})` }] });

    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });

    const body = eq[args[0].toLowerCase()];

    queue.player.node.send({
        op: 'filters',
        guildId: queue.guildId,
        ...body,
    });

    const sayoriEmoji = client.customEmojis.get("smug");
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `applied \`${args[0].toLowerCase()}\` equalizer preset to your current queue! this might take a few second... ${sayoriEmoji}` }], content: `to reset all effect, use \`${prefix}reset\`` })
    if (queue.textChannel.id !== message.channel.id) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} applied \`${args[0].toLowerCase()}\` equalizer preset to the current queue ${sayoriEmoji}` }], content: `to reset all effect, use \`${prefix}reset\`` });
};



exports.help = {
    name: "equalizer",
    description: "apply equalizer to match your liking, or to suit some genres",
    usage: ["equalizer"],
    example: ["equalizer"]
};

exports.conf = {
    aliases: ['eq'],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};