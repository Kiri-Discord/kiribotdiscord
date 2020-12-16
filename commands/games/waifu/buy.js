const { userExists } = require("../../../model/user")
const { Waifu } = require("../../../model/waifu")
const { buyFromStore, canUserBuyItem } = require("../../../features/waifu/store")
const { prices } = require("../../../features/waifu/store")

const commandBuy = async (user, query, prefix) => {
    const response = await userExists(user, prefix);
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {
        response.query = "yee haw"

        const waifu = await Waifu.findOne({
            master: foundUser._id,
        })

        if (query.length > 2) {
            const purschasable = query[2]

            switch (purschasable.toLowerCase()) {
                case "attack":
                    const messageAttack = `${user.at}, you have bought 1 point of attack for you waifu`
                    response.query = await buyFromStore(
                        foundUser,
                        prices.attack,
                        messageAttack
                    )

                    waifu.attack += 1
                    break

                case "defense":
                    const queryDefense = `${user.at}, you have bought 1 point of defense for you waifu`
                    response.query = await buyFromStore(
                        foundUser,
                        prices.defense,
                        messageDefense
                    )

                    waifu.defense += 1
                    break

                case "health":
                    const messageHealth = `${user.at}, you have bought 1 point of health for you waifu`
                    response.query = await buyFromStore(
                        foundUser,
                        prices.health,
                        messageHealth
                    )

                    waifu.health += 1
                    break

                default:
                    const buyEquipment = await canUserBuyItem(foundUser, purschasable)
                    response.query = buyEquipment.query
                    break
            }
            await waifu.save()
        } else {
            response.query = `${user.at}, you need to write a valid item from the store!`
        }
    }

    return response
}

module.exports = commandBuy
