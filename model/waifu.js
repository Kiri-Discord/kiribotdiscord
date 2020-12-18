const mongoose = require("mongoose")


const attackBuff = 1 // Always one
const defenseBuff = Math.floor(Math.random() * 2) + 1 // 1 - 3
const healthkBuff = Math.floor(Math.random() * 3) + 1 // 1 - 4

const waifuSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "",
    },

    image: {
        type: String,
        default: null,
    },

    attack: {
        type: Number,
        default: 55,
    },

    defense: {
        type: Number,
        default: 55,
    },

    health: {
        type: Number,
        default: 55,
    },

    weapon: {
        type: Object,
        default: null,
    },

    armor: {
        type: Object,
        default: null,
    },

    master: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
})


const increaseWaifuStats = async (user) => {
    const randomOption = Math.floor(Math.random() * 10)
    let messageResponse = undefined
    let statMessage = undefined
    let waifuReponse = undefined

    try {
        const waifu = await Waifu.findOne({
            master: user._id,
        })

        if (randomOption >= 1 && randomOption <= 3) {
            waifu.attack = waifu.attack + attackBuff
            statMessage = "`+" + attackBuff + " Attack`"
        } else if (randomOption >= 4 && randomOption <= 6) {
            waifu.defense = waifu.defense + defenseBuff
            statMessage = "`+" + defenseBuff + " Defense`"
        } else {
            waifu.health = waifu.health + healthkBuff
            statMessage = "`+" + healthkBuff + " Health`"
        }

        await waifu.save()
        messageResponse = "yeet, your waifu is now " + statMessage + " stronger!"
    } catch (e) {
        messageResponse = `${user.at}, somethin went wrong, try again later!`
    }

    waifuReponse = {
        query: messageResponse,
    }

    return waifuReponse
}

const equipWaifu = async (user, storage, item) => {
    let response = ""

    try {
        const waifu = await Waifu.findOne({
            master: user._id,
        })

        const equipmentIndex = storage.waifuEquipments.findIndex((equipment) => equipment.name === item.name)
        const equipment = storage.waifuEquipments[equipmentIndex]

        storage.waifuEquipments.splice(equipmentIndex, 1)

        if (item.type.toLowerCase() === 'sword' && !item.equiped) {
            if (waifu.weapon) {
                const oldWeapon = waifu.weapon
                oldWeapon.equiped = false

                waifu.weapon = equipment
                reduceStatsWithEquipment(waifu, oldWeapon)
                increaseStatsWithEquipment(waifu, equipment)

                storage.waifuEquipments.push(oldWeapon)
            } else {
                // no? hmm then equip it!
                equipment.equiped = true
                waifu.weapon = equipment

                increaseStatsWithEquipment(waifu, equipment)
            }

            response = `${user.at}, i has equiped ${item.name} to your waifu !`

        } else if (item.type.toLowerCase() === 'armor' && !item.equiped) {
            if (waifu.armor) {
                const oldArmor = waifu.armor
                oldArmor.equiped = false

                waifu.armor = equipment

                reduceStatsWithEquipment(waifu, oldArmor)
                increaseStatsWithEquipment(waifu, equipment)

                storage.waifuEquipments.push(oldArmor)

            } else {
                equipment.equiped = true
                waifu.armor = equipment

                increaseStatsWithEquipment(waifu, equipment)
            }

            response = `${user.at}, i has equiped ${item.name} to your waifu !`

        } else {
            response = `${user.at}, you cannot equip that!`
        }

        await storage.save()
        await waifu.save()

    } catch (e) {
        console.log(e)
        response = `${user.at}, there's been an error, try again later!`
    }

    return response
}

const increaseStatsWithEquipment = (waifu, equipment) => {
    waifu.attack += equipment.bonusStats.attack
    waifu.defense += equipment.bonusStats.defense
    waifu.health += equipment.bonusStats.health
}

const reduceStatsWithEquipment = (waifu, equipment) => {
    waifu.attack -= equipment.bonusStats.attack
    waifu.defense -= equipment.bonusStats.defense
    waifu.health -= equipment.bonusStats.health
}

const formatEquipment = (equipment) => {
    let query = ""

    if (!equipment) {
        query = `nothing equipped`
    } else {
        query = `${equipment.name} (Attack +${equipment.bonusStats.attack} / Defense +${equipment.bonusStats.defense} / Health +${equipment.bonusStats.health})`
    }

    return query
}

const Waifu = mongoose.model("Waifu", waifuSchema)

module.exports = {
    Waifu,
    increaseWaifuStats,
    equipWaifu,
    formatEquipment,
}
