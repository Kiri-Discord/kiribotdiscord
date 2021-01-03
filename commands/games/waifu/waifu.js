const discord = require("discord.js")

const { userExists, userExistsById } = require("../../../model/user")
const { Waifu, formatEquipment } = require("../../../model/waifu")

const commandWaifu = async (user, query, prefix, client) => {
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
                .setImage(waifu.image)
                .setAuthor(foundOtherUser.username + "'s waifu", client.user.displayAvatarURL())
                .setColor("#eae267")
                .addField("Waifu name", `${waifu.name}`, true)
                .addField("Attack", waifu.attack, true)
                .addField("Defense", waifu.defense, true)
                .addField("Health", waifu.health, true)
                .addField("Combats won", foundOtherUser.combatsWon, true)
                .addField("Weapon", `${formatEquipment(waifu.weapon)}`, true)
                .addField("Armor", `${formatEquipment(waifu.armor)}`, true)
            } else {
                response.query = `${user.at}, that user does not exist (or) does not have a waifu :(`
            }
        } else {
            const waifu = await Waifu.findOne({
                master: foundUser._id,
            })
            //My waifu
            response.query = new discord.MessageEmbed()
            .setImage(waifu.image)
            .setAuthor(foundUser.username + "'s waifu", client.user.displayAvatarURL())
            .setColor("#DF77EC")
            .addField("Waifu name", `${waifu.name}`, true)
            .addField("Attack", waifu.attack, true)
            .addField("Defense", waifu.defense, true)
            .addField("Health", waifu.health, true)
            .addField("Combats won", foundUser.combatsWon, true)
            .addField("Weapon", `${formatEquipment(waifu.weapon)}`, true)
            .addField("Armor", `${formatEquipment(waifu.armor)}`, true)
        }
    }

    return response
}

module.exports = commandWaifu
