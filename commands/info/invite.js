const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

exports.run = async(client, message, args) => {
    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setStyle('LINK')
        .setURL('https://kiribot.xyz')
        .setLabel('Website'),
        new MessageButton()
        .setStyle('LINK')
        .setURL('https://top.gg/bot/859116638820761630')
        .setLabel('Top.gg Website'),
        new MessageButton()
        .setStyle('LINK')
        .setURL('https://discord.gg/kJRAjMyEkY')
        .setLabel('Our support server!'),
        new MessageButton()
        .setStyle('LINK')
        .setURL('https://discord.gg/kJRAjMyEkY')
        .setLabel('Our community server!')
    );
    const embed = new MessageEmbed()
        .setThumbnail(client.user.displayAvatarURL({ size: 4096, dynamic: true }))
        .setColor('#ffe6cc')
        .setDescription('you can invite me [here](https://top.gg/bot/859116638820761630)')
        .addField(`**don't forget to join those server as well to make friends or just want to get support when using me:**`, '[Sefiria](https://discord.gg/D6rWrvS), where everything started, all of my commands were built from this server\'s community. *(join now if you play AstolfoBot)*\n\n[my support server](https://discord.gg/kJRAjMyEkY), if you want to get some support or contribute!')
    return message.channel.send({ embeds: [embed], components: [row] });
};
exports.help = {
    name: "invite",
    description: "more info on how to invite me.",
    usage: ["invite"],
    example: ["invite"]
}

exports.conf = {
    aliases: ['inviteme'],
    cooldown: 2,
    channelPerms: ["EMBED_LINKS"]
};