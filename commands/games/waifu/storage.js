const discord = require("discord.js")

const { userExists } = require("../../../model/user")
const {
    getStorage,
    formatItemsFromStorage,
    formatEquipmentsFromStrorage,
} = require("../../../model/storage.js")

const commandStorage = async (user, query, prefix) => {
    const response = await userExists(user, prefix);
    if (!response.user) response.query = response.message;
    const foundUser = response.user

    if (foundUser) {
        const storageResponse = await getStorage(foundUser)
        const storage = storageResponse.storage

        if (!storageResponse.error) {
            const embedInfo = new discord.MessageEmbed()
                .setTitle(`${user.username}'s storage`)
                .setColor("RANDOM")
                .addField("Items", `${formatItemsFromStorage(storage.items)}`, true)
                .addField(
                    "Equipments",
                    `${formatEquipmentsFromStrorage(storage.waifuEquipments)}`, true
                )
                .addField("Money", `${storage.money}$`, true)

            response.query = embedInfo
        } else {
            response.query = storageResponse.query
        }
    }

    return response
}

module.exports = commandStorage