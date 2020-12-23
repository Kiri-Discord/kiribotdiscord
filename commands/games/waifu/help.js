const discord = require('discord.js')

const commandHelp = async (client, prefix, message) => {

    const embedInfo = new discord.MessageEmbed()
    .setTimestamp()
    .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setFooter(client.user.username, client.user.displayAvatarURL())
    .setThumbnail(client.user.displayAvatarURL())
    .setTitle('Waifu? Battle?')
    .setColor('RANDOM')
    .addField('Adventure', "`" + prefix + "wb adventure` you and your waifu embark on an adventure on a mystical new world.")
    .addField('Buy', "`" + prefix + "wb buy <Name of item>` buy an item from the store.")
    .addField('Create', "`" + prefix + "wb create` Creates your waifu if you don't have one.")
    .addField('Equip', "`" + prefix + "wb equip` equips an equipment from your storage.")
    .addField('Fight', "`" + prefix + "wb fight @someone` Starts a fight with a waifu owner.")
    .addField('Help', "`" + prefix + "wb help` Sends a list of all commands.")
    .addField('Isekai', "`" + prefix + "wb isekai` Sends you and your waifu into a new world and find something cool.")
    .addField('Timer', "`" + prefix + "wb timer` Shows all your cooldown timers.")
    .addField('Train', "`" + prefix + "wb train` Increases your waifu stats.")
    .addField('Sell', "`" + prefix + "wb sell` sells the items from your storage.")
    .addField('Storage', "`" + prefix + "wb storage` displays all of your items and money.")
    .addField('Store', "`" + prefix + "wb store` displays all items you can buy from the store.")
    .addField('Waifu', "`" + prefix + "wb waifu` Displays your waifu information.")
    .addField('Set avatar', "`" + prefix + "wb pfp <image link>` Change your waifu's avatar.")

    return embedInfo
}

module.exports = commandHelp