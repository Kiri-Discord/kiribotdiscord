const discord = require("discord.js")

const { userExists } = require("../../../model/user")
const { cooldownTimeMessage } = require("../../../features/waifu/messages")

const commandTimer = async (user, prefix) => {
    const response = await userExists(user, prefix);
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {
        response.query = new discord.MessageEmbed()
            .setTitle("Cooldowns")
            .setColor("#21E6EC")
            .addField(
                "Adventure",
                cooldownTimeMessage(foundUser.adventureCooldown),
                true
            )
            .addField("Train", cooldownTimeMessage(foundUser.trainCooldown), true)
            .addField("Isekai", cooldownTimeMessage(foundUser.isekaiCooldown), true)
            .addField("Fight", cooldownTimeMessage(foundUser.fightCooldown), true)
    }

    return response
}

module.exports = commandTimer
