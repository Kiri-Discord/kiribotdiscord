const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const embed = new MessageEmbed()
        .setThumbnail(client.user.displayAvatarURL({ size: 4096, dynamic: true }))
        .setColor('#ffe6cc')
        .setDescription('you can invite me [here](https://discord.com/api/oauth2/authorize?client_id=859116638820761630&permissions=4294831607&scope=bot%20applications.commands)')
        .addField(`**don't forget to join those server as well to make friends or just want to get support when using me:**`, '[Sefiria](https://discord.gg/D6rWrvS), where everything started, all of my commands were built from this server\'s community. *(join now if you play AstolfoBot)*\n\n[my support server](https://discord.gg/kJRAjMyEkY), if you want to get some support or contribute!')
    return interaction.reply({ embeds: [embed] });
};
exports.help = {
    name: "invite",
    description: "more info on how to invite me.",
    usage: ["invite"],
    example: ["invite"]
}

exports.conf = {
    cooldown: 2,
    channelPerms: ["EMBED_LINKS"],
    data: new SlashCommandBuilder()
        .setName(exports.help.name).setDescription(exports.help.description),

};