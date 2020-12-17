const { userExists } = require("../../../model/user")
const { getStorage } = require("../../../model/storage.js")
const { calculateCooldown } = require("../../../features/waifu/cooldown")
const { goAdventure } = require('../../../features/waifu/adventure')

const commandAdventure = async (user, prefix) => {
    const response = await userExists(user, prefix)
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            const now = new Date()
            const cooldownTime = foundUser.adventureCooldown

            if (cooldownTime <= now) {
                const adventure = goAdventure().dialogue()

                storage.money += adventure.money
                await storage.save()

                const newAdventureCooldown = now.setMinutes(
                    now.getMinutes() + 30
                )
                foundUser.adventureCooldown = newAdventureCooldown
                await foundUser.save()

                response.query = adventure.query
            } else {
                const cooldown = calculateCooldown(now, cooldownTime)
                response.query =
                    "you need to wait `" +
                    cooldown.hours +
                    "hours " +
                    cooldown.minutes +
                    "minutes " +
                    cooldown.seconds +
                    "seconds` until you can use this command!"
            }
        } else {
            response.query = storageResponse.query
        }
    }

    return response
}

module.exports = commandAdventure
