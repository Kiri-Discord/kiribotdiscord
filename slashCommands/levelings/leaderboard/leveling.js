const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { paginateEmbed } = require('../../../util/util');
const { millify } = require('millify');
const ordinal = require('ordinal');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    let data = await client.db.leveling.find({
        guildId: interaction.guild.id,
    }).sort({
        xp: -1
    });
    if (!data || !data.length) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ i can't find any leveling data for this guild :pensive: try chatting more to level up or use \`/leveling toggle on\` to set it up :smile:` }] });

    const emoji = {
        "1": ":crown:",
        "2": ":trident:",
        "3": ":trophy:",
        "4": ":medal:",
        "5": ":zap:"
    };
    let arr = [];
    let rank = interaction.guild.memberCount;
    data.forEach((user, index) => {
        let member = interaction.guild.members.cache.get(user.userId);
        if (!member) {
            client.db.leveling.findOneAndDelete({
                userId: user.userId,
                guildId: interaction.guild.id,
            }, (err) => {
                if (err) logger.log('error', err)
            });
            arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} ||Left user|| —  Level: \`${user.level}\` | XP: \`${millify(user.xp)}\``);
        } else {
            if (member.user.id === interaction.user.id) rank = index + 1;
            arr.push(`\`${index + 1}\` ${emoji[index + 1] ? emoji[index + 1] : ':reminder_ribbon:'} **${member.user.username}** — Level: \`${user.level}\` | XP: \`${millify(user.xp)}\``);
        };
    });
    const arrSplitted = [];
    while (arr.length) {
        const toAdd = arr.splice(0, arr.length >= 10 ? 10 : arr.length);
        arrSplitted.push(toAdd);
    };
    const arrEmbeds = [];
    arrSplitted.forEach((item, index) => {
        const embed = new MessageEmbed()
            .setColor('#bee7f7')
            .setThumbnail(interaction.guild.iconURL({ size: 4096, dynamic: true }))
            .setDescription(`you can level up by [sending messages](https://support.discord.com/hc/en-us/articles/360034632292-Sending-Messages) in ${interaction.guild.name}!`)
            .setFooter({text: `you are ranked ${ordinal(rank)} in this guild :)`})
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
    const msg = await interaction.editReply({
        embeds: [arrEmbeds[0]],
        components: [row],
        content: `page 1 of ${arrEmbeds.length}`,
        fetchReply: true
    });
    const filter = async res => {
        if (res.user.id !== interaction.user.id) {
            await res.reply({
                embeds: [{
                    description: `those buttons are for ${interaction.user.toString()} :pensive:`
                }],
                ephemeral: true
            });
            return false;
        } else {
            await res.deferUpdate();
            return true;
        }
    };
    return paginateEmbed(arrEmbeds, msg, row, filter, { author: interaction.user, channel: interaction.channel });
};