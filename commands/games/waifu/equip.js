const { userExists } = require("../../../model/user")
const { equipWaifu } = require("../../../model/waifu")
const { getStorage } = require("../../../model/storage")

const commandEquip = async (user, query, prefix) => {
    const response = await userExists(user, prefix);
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            if (query.length > 2) {
                const equip = query[2]
                const foundEquipment = storage.waifuEquipments.find(
                    (equipment) =>
                        equipment.name.toLowerCase() === equip.toLowerCase()
                )

                if (foundEquipment) {
                    response.query = await equipWaifu(
                        foundUser,
                        storage,
                        foundEquipment
                    )
                } else {
                    response.query = `${user.at}, you don't own ${equip}!`
                }
            } else {
                response.query =
                    user.at + " use `" + `${prefix}wb equip <equipment> (Example: ${prefix}wb equip armor-candy)` + "`"
            }
        } else {
            response.query = storageResponse.query
        }
    }

    return response
}

module.exports = commandEquip
