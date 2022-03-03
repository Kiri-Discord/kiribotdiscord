const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const db = client.guildsStorage.get(interaction.guild.id);
    await interaction.deferReply();
    let data = await client.db.levelingRewards.find({
        guildId: interaction.guild.id,
    }).sort([
        ["level", "descending"]
    ]);
    if (!data || !data.length) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ there is no leveling role reward avaliable for your server :pensive:` }] });
    const emoji = {
        "1": ":crown:",
        "2": ":trident:",
        "3": ":trophy:",
        "4": ":medal:",
        "5": ":zap:"
    };

    const arr = data.map((reward, index) => `${emoji[index + 1] ? `${emoji[index + 1]} ` : ''}<@&${reward.roleId}> • Level **${reward.level}**`);

    const embed = new MessageEmbed()
    .setColor('#abb7b2')
    .setThumbnail(interaction.guild.iconURL({ size: 4096, dynamic: true }))
    .setTitle(`role rewards for ${interaction.guild.name}:`)
    .setDescription(arr.join('\n'))
    .setFooter({ text: `those are the roles that will be given to you when you reach a certain levels 🙂` });

    return interaction.editReply({
        embeds: [embed],
        content: !db.enableLevelings ? `❌ leveling rewards will not be given since leveling is disabled on the server :( to enable it again, you can use \`/leveling on\`!` : null
    });
};


exports.help = {
    name: "rewards",
    description: "list all avaliable role rewards on the server 🎉",
    usage: ["rewards"],
    example: ["rewards"]
};

exports.conf = {
    cooldown: 3,
    data: new SlashCommandBuilder()
    .setName(exports.help.name)
    .setDescription(exports.help.description),
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
    
};