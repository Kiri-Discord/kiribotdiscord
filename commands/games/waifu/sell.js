const { userExists } = require("../../../model/user")
const { sellItems } = require("../../../features/waifu/store")

const commandSell = async (user, query, prefix) => {
    const response = await userExists(user, prefix);
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {
        response.query = `${user.at} ooga booga`

        if (query.length > 2) {
            const itemAndQuantity = query[2].split("-")
            const item = itemAndQuantity[0]
            const quantity = itemAndQuantity[1]

            if (item && Number.isInteger(parseInt(quantity))) {
                response.query = await sellItems(foundUser, item, quantity)
            } else {
                response.query =
                    user.at +
                    `, you have to specify an object and quantity (example: \`${prefix}wb sell coal-10\`)`
            }
        } else {
            response.query =
                user.at +
                `, you have to specify an object and quantity (example: \`${prefix}wb sell coal-10\`)`
        }
    }

    return response
}

module.exports = commandSell