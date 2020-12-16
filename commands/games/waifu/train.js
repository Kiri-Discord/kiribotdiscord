const { userExists } = require("../../../model/user")
const { increaseWaifuStats } = require('../../../model/waifu')
const { calculateCooldown } = require('../../../features/waifu/cooldown');

const commandTrain = async (user, prefix) => {

    const response = await userExists(user, prefix);
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {

        const now = new Date()
        const cooldownTime = foundUser.trainCooldown

        if (cooldownTime <= now) {
            //Get information with the waifu
            const waifuResponse = await increaseWaifuStats(foundUser)
            response.query = waifuResponse.query

            const newTrainingCooldown = now.setMinutes(now.getMinutes() + 30)
            foundUser.trainCooldown = newTrainingCooldown

            await foundUser.save()

        } else {
            const cooldown = calculateCooldown(now, cooldownTime)
            response.query = user.at + ", You need to wait `" +
                cooldown.hours + "hours " +
                cooldown.minutes +
                "minutes " +
                cooldown.seconds +
                "seconds` until you can use this command"
        }

    }

    return response
}

module.exports = commandTrain