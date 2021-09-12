const text = require('../../features/waifu/string');
const waifuDB = require('../../features/waifu/waifu.json');
const { MessageEmbed } = require('discord.js')

exports.run = async(client, message, args) => {
    const waifu = waifuDB[Math.floor(Math.random() * (waifuDB.length))];
    const no = Math.floor(Math.random() * waifu.images.length);

    message.channel.sendTyping();

    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(text.truncate([waifu.names.en, waifu.names.jp, waifu.names.alt].filter(Boolean).join('\n'), 200), waifu.avatar || null)
        .setDescription([waifu.from.name, waifu.from.type].filter(Boolean).map(x => `*${x}*`).join('\n'))
        .setImage(waifu.images[no])
        .setFooter([
            `❣️${(100 * (((1 - waifu.statistics.hate / (waifu.statistics.love + waifu.statistics.fav)) * 0.6) + ((waifu.statistics.upvote / (waifu.statistics.upvote + waifu.statistics.downvote)) * 0.4))).toFixed(2)}`,
            `${ no + 1 } of ${ waifu.images.length }`
        ].join('\u2000|\u2000'));

    return message.channel.send({ embeds: [embed] }).then(m => m.react('💖'));
};

exports.help = {
    name: "waifu",
    description: "displays a random waifu image",
    usage: ["waifu"],
    example: ["waifu"]
}

exports.conf = {
    aliases: ['wa'],
    cooldown: 5,
    guildOnly: true,
};