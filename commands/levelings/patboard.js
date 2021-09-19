const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { paginateEmbed } = require('../../util/util');
const patSchema = require('../../model/pat')

exports.run = async(client, message, args, prefix) => {
    let data = await patSchema.find({
        guildId: message.guild.id,
    }).sort([
        ["received", "descending"]
    ]);
    if (!data || !data.length) return message.channel.send({ embeds: [{ color: "f3f3f3", description: `❌ seems like no one in your guild has decided to pat yet :( once someone is pat, their pat count will show here!` }] });
    const emoji = {
        "1": ":crown:",
        "2": ":trident:",
        "3": ":trophy:",
        "4": ":medal:",
        "5": ":zap:"
    };

    let arr = [];

    data.map((user, index) => {
        let member = message.guild.members.cache.get(user.userId);
        const addS = user.received === 1 ? '' : 's';
        if (!member) {
            patSchema.findOneAndDelete({
                userId: user.userId,
                guildId: message.guild.id,
            }, (err) => {
                if (err) logger.log('error', err)
            });
            arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} ||Left user|| was pat \`${user.received}\` time${addS}`);
        } else {
            arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} **${member.user.username}** was pat \`${user.received}\` time${addS}`);
        }
    });
    const arrSplitted = [];
    while (arr.length) {
        const toAdd = arr.splice(0, arr.length >= 10 ? 10 : arr.length);
        arrSplitted.push(toAdd);
    };
    const arrEmbeds = [];
    arrSplitted.map((item, index) => {
        const embed = new MessageEmbed()
            .setColor(message.guild.me.displayHexColor)
            .setThumbnail(message.guild.iconURL({ size: 4096, dynamic: true }))
            .setDescription(`you can pat others with \`${prefix}pat\`!`)
            .addField('\u200b', item.join('\n'))
        arrEmbeds.push(embed);
    });
    const components = [];
    if (arrEmbeds.length > 1) {
        components.push(
            new MessageButton()
            .setCustomId("previousbtn")
            .setEmoji(client.customEmojis.get('left') ? client.customEmojis.get('left').id : '⬅️')
            .setStyle("SECONDARY"),
            new MessageButton()
            .setCustomId('jumpbtn')
            .setEmoji(client.customEmojis.get('jump') ? client.customEmojis.get('jump').id : '↗️')
            .setStyle('SECONDARY'),
            new MessageButton()
            .setCustomId("nextbtn")
            .setEmoji(client.customEmojis.get('right') ? client.customEmojis.get('right').id : '➡️')
            .setStyle("SECONDARY")
        )
    };
    components.push(new MessageButton()
        .setCustomId('clearbtn')
        .setEmoji(client.customEmojis.get('trash') ? client.customEmojis.get('trash').id : '🗑️')
        .setStyle('DANGER'));
    const row = new MessageActionRow()
        .addComponents(components);
    const msg = await message.channel.send({
        embeds: [arrEmbeds[0]],
        components: [row],
        content: `page 1 of ${arrEmbeds.length}`,
    });
    const filter = async res => {
        if (res.user.id !== message.author.id) {
            await res.reply({
                embeds: [{
                    description: `those buttons are for ${message.author.toString()} :pensive:`
                }],
                ephemeral: true
            });
            return false;
        } else {
            await res.deferUpdate();
            return true;
        }
    };
    return paginateEmbed(arrEmbeds, msg, row, filter, message);
};
exports.help = {
    name: "patboard",
    description: "display the guild's pat leaderboard",
    usage: ["patboard"],
    example: ["patboard"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};