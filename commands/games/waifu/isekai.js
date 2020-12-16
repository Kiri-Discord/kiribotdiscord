const { userExists } = require("../../../model/user")
const { getRandromDrop } = require("../../../features/waifu/drops")
const { calculateCooldown } = require("../../../features/waifu/cooldown")
const { getStorage } = require("../../../model/storage.js")

const commandIsekai = async (user, prefix) => {
    const response = await userExists(user, prefix);
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            const now = new Date()
            const cooldownTime = foundUser.isekaiCooldown

            const randomDrop = getRandromDrop()

            if (cooldownTime <= now) {
                const storageHasObjet = storage.items.find(
                    (item) => item.name === randomDrop.name
                )

                if (!storageHasObjet) {
                    storage.items.push(randomDrop)
                } else {
                    for (let i = 0; i < storage.items.length; i++) {
                        if (randomDrop.name === storage.items[i].name) {
                            const newItem = storage.items[i]
                            newItem.count++
                            storage.items.push(newItem)
                            storage.items.splice(i, 1)
                            break
                        }
                    }
                }
                await storage.save()
                response.query = `${user.at}, you and your waifu have fell into a new world and found ${randomDrop.name}`

                foundUser.isekaiCooldown = now.setMinutes(now.getMinutes() + 30)
                await foundUser.save()
            } else {
                const cooldown = calculateCooldown(now, cooldownTime)
                response.query =
                    user.at +
                    ", You need to wait `" +
                    cooldown.hours +
                    "hours " +
                    cooldown.minutes +
                    "minutes " +
                    cooldown.seconds +
                    "seconds` until you can use this command"
            }
        } else {
            response.query = storageResponse.query
        }
    }
    return response
}

module.exports = commandIsekai
