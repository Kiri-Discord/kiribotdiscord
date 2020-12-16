const discord = require("discord.js")

const { userExists } = require("../../../model/user")
const {
    prices,
    items,
    formatRequiredObjects,
    formatStats,
} = require("../../../features/waifu/store")

const commandStore = async (user, prefix, client, message) => {
    const response = await userExists(user, prefix)
    const foundUser = response.user;
    if (!response.user) response.query = response.message; 

    if (foundUser) {
        const embedInfo = new discord.MessageEmbed()
            .setThumbnail(client.user.displayAvatarURL())
            .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
            .setTitle("Store")
            .setColor("RANDOM")

        items.forEach((item) => {
            embedInfo.addField(`${item.name}`, `${item.price}$\n ${formatRequiredObjects(item.requiredObjects)} BONUS STATS: ${formatStats(item.bonusStats)}`, true)
        })

        embedInfo
            .addField("Attack (1 point)", `${prices.attack}$`)
            .addField("Defense (1 point)", `${prices.defense}$`)
            .addField("Health (1 point)", `${prices.health}$`)

        response.query = embedInfo
    }

    return response
}

module.exports = commandStore
