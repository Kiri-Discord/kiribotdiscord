const { MessageEmbed } = require('discord.js');
exports.run = async(client, message, args, prefix) => {
    const db = client.guildsStorage.get(message.guild.id);
    let data = await client.db.levelingRewards.find({
        guildId: message.guild.id,
    }).sort([
        ["level", "descending"]
    ]);
    if (!data || !data.length) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ there is no leveling role reward avaliable for your server :pensive:` }] });
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
    .setThumbnail(message.guild.iconURL({ size: 4096, dynamic: true }))
    .setTitle(`role rewards for ${message.guild.name}:`)
    .setDescription(arr.join('\n'))
    .setFooter({ text: `those are the roles that will be given to you when you reach a certain levels 🙂` });

    return message.channel.send({
        embeds: [embed],
        content: !db.enableLevelings ? `❌ leveling rewards will not be given since leveling is disabled on the server :( to enable it again, you can use \`${prefix}leveling on\`!` : null
    });
};


exports.help = {
    name: "rewards",
    description: "list all avaliable role rewards on the server",
    usage: ["rewards"],
    example: ["rewards"]
};

exports.conf = {
    aliases: ['reward', 'role-rewards'],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};