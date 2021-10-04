const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { stripIndents } = require('common-tags');

exports.run = async(client, message, args) => {
    let member = await getMemberfromMention(args[0], message.guild) || message.member;
    let { user } = member;

    const avatar = user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' });

    const embed = new MessageEmbed()
        .setTitle(`${user.tag}`)
        .setDescription(stripIndents `
  ID: \`${user.id}\`
  [**Avatar URL**](${avatar})
  `)
        .setColor(member.displayHexColor)
        .setImage(avatar);
    const row = new MessageActionRow()
        .addComponents(new MessageButton()
            .setStyle('LINK')
            .setURL(avatar)
            .setLabel('Avatar URL'))
    return message.channel.send({ embeds: [embed], components: [row] });
}

exports.help = {
    name: "avatar",
    description: "display an user's avatar",
    usage: ["avatar [@user]", "avatar [user ID]"],
    example: ["avatar `@kiri#6822`", "avatar 84878844578778", "avatar"]
}

exports.conf = {
    aliases: ["icon", "pfp", "ava"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}