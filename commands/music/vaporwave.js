const { canModifyQueue } = require("../../util/musicutil");
const eq = require('../../assets/equalizer');

exports.run = async(client, message, args, prefix) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }] });
    if (queue.pending) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }] });
    if (!canModifyQueue(message.member)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }] });
    if (queue.karaoke.isEnabled) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `applying vaporwave is not possible when scrolling-lyrics is on :pensive: you can turn it off by \`${prefix}scrolling-lyrics off\`` }] });

    let cooldownStorage = await client.db.cooldowns.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!cooldownStorage) {
        const model = client.db.cooldowns;
        cooldownStorage = new model({
            userId: message.author.id,
            guildId: message.guild.id
        });
    };
    let expire = cooldownStorage.ticketExpire;
    if (!expire || expire < Date.now()) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `your 🎫 **Effect Ticket** was expired, or you don't have one! obtain one with \`${prefix}ticket\`!` }] });
    const body = eq.vaporwave;

    queue.player.node.send({
        op: 'filters',
        guildId: queue.guildId,
        ...body,
    });

    const sayoriEmoji = client.customEmojis.get("smug");

    if (queue.textChannel.id !== message.channel.id && !client.deletedChannels.has(queue.textChannel)) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${message.author} applied vaporwave to the current queue ${sayoriEmoji}` }], content: `to reset all effect, use \`${prefix}reset\`!` });
    if (client.deletedChannels.has(queue.textChannel)) queue.textChannel = message.channel;
    return message.channel.send({ embeds: [{ color: "#bee7f7", description: `applied vaporwave to your current queue! this might take a few second... ${sayoriEmoji}` }], content: `to reset all effect, use \`${prefix}reset\`!` })
};


exports.help = {
    name: "vaporwave",
    description: "apply vaporwave to your current music queue 😔",
    usage: ["vaporwave"],
    example: ["vaporwave"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};