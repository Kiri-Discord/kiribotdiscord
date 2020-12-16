const discord = require("discord.js")

const { userExists, userExistsById } = require("../../../model/user")
const { Waifu, formatEquipment } = require("../../../model/waifu")

const commandWaifu = async (user, query, prefix) => {
    let response = undefined

    response = await userExists(user, prefix);
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {
        if (query.length > 2) {
            const discordId = query[2].replace(/[<>@!]/g, "")
            response = await userExistsById(discordId)
            const foundOtherUser = response.user

            if (foundOtherUser) {
                const waifu = await Waifu.findOne({
                    master: foundOtherUser._id,
                })

                //someone else's waifu
                response.query = new discord.MessageEmbed()
                    .setTitle(foundOtherUser.username + "'s waifu")
                    .setColor("#eae267")
                    .addField("Waifu name", `${waifu.name}`)
                    .addField("Attack", waifu.attack)
                    .addField("Defense", waifu.defense)
                    .addField("Health", waifu.health)
                    .addField("Combats won", foundOtherUser.combatsWon)
                    .addField("Weapon", `${formatEquipment(waifu.weapon)}`)
                    .addField("Armor", `${formatEquipment(waifu.armor)}`)
            } else {
                response.query = `${user.at}, that user does not exist (or) does not have a waifu!`
            }
        } else {
            const waifu = await Waifu.findOne({
                master: foundUser._id,
            })

            //My waifu
            response.query = new discord.MessageEmbed()
                .setTitle(foundUser.username + "'s waifu")
                .setColor("#DF77EC")
                .addField("Waifu Name", `${waifu.name}`)
                .addField("Attack", waifu.attack)
                .addField("Defense", waifu.defense)
                .addField("Health", waifu.health)
                .addField("Combats won", foundUser.combatsWon)
                .addField("Weapon", `${formatEquipment(waifu.weapon)}`)
                .addField("Armor", `${formatEquipment(waifu.armor)}`)
        }
    }

    return response
}

module.exports = commandWaifu
