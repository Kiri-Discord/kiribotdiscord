const { userExists, userExistsById } = require("../../../model/user")
const { startFight } = require("../../../features/waifu/fight")
const { fightSyntax } = require("../../../features/waifu/messages")

const commandFight = async (user, query, prefix, message) => {
    const response = await userExists(user, prefix);
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {
        //!wb fight @someone
        if (query.length > 2) {
            const challengedUserId = query[2].replace(/[<>@!]/g, "") // <@999999999999999> -> 999999999999999
            const challengeResponse = await userExistsById(challengedUserId)
            const challengedUser = challengeResponse.user

            if (challengedUser) {
                if (challengedUser.id === foundUser.id) {
                    response.query = `${user.at}, you can't fight with yourself!`
                } else {
                    response.query = await startFight(
                        foundUser,
                        challengedUser,
                        message
                    )
                }
            } else {
                response.query = `${user.at}, that user does not exist or doesn't have a waifu!`
            }
        } else {
            response.query = fightSyntax(user, prefix)
        }
    }

    return response
}

module.exports = commandFight
