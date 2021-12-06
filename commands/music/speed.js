const { canModifyQueue } = require("../../util/musicutil");

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.karaoke.isEnabled) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `setting the speed is not possible when scrolling-lyrics is on :pensive: you can turn it off by \`${prefix}scrolling-lyrics off\`` }] });

    let cooldownStorage = await client.cooldowns.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!cooldownStorage) {
        const model = client.cooldowns;
        cooldownStorage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
    };
    let expire = cooldownStorage.ticketExpire;
    if (!expire || expire < Date.now()) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `your 🎫 **Effect Ticket** was expired, or you don't have one! obtain one with \`${prefix}ticket\`!` }] });

    const rate = args[0];
    if (!rate) return message.reply({ embeds: [{ color: "#bee7f7", description: `you should specify the speed rate, ranging from 0.1 to 10! :pensive:` }] });
    if (isNaN(rate)) return message.reply({ embeds: [{ color: "#bee7f7", description: `the amount of speed rate must be a number ❌ (0.1 to 10)` }] });
    if (Number(rate) < 0.1 || Number(rate) > 10) return message.reply({ embeds: [{ color: "#bee7f7", description: `the amount of speed up rate should lie between 0.1 and 10 :pensive:` }] });

    const body = {
        timescale: { speed: Number(rate) }
    }
    queue.player.node.send({
        op: 'filters',
        guildId: queue.guildId,
        ...body,
    });
    const sayoriEmoji = client.customEmojis.get("sayori");
    message.channel.send({ embeds: [{ color: "#bee7f7", description: `changed the speed rate of the current queue to **${Number(rate).toFixed(1)}x**! ${sayoriEmoji}` }], content: `to reset all effect, use \`${prefix}reset\`` })
    if (queue.textChannel.id !== message.channel.id && !queue.textChannel.deleted) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} changed the speed rate of the current queue to **${rate.toFixed(1)}x**! ${sayoriEmoji}` }], content: `to reset all effect, use \`${prefix}reset\`` });
    if (queue.textChannel.deleted) queue.textChannel = message.channel;
};
exports.help = {
    name: "speed",
    description: "speed up or slow down songs in the current queue",
    usage: ["speed `<rate>`"],
    example: ["speed `2`"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};
