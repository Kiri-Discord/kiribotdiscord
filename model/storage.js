const mongoose = require('mongoose')

const storageSchema = new mongoose.Schema({

    items: {
        type: [Object],
        default: []
    },
    money: {
        type: Number,
        default: 0,
    },
    waifuEquipments: {
        type: [Object],
        default: []
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

const getStorage = async (user) => {

    const response = {}

    try {
        const discordId = user._id
        const storageExists = await Storage.findOne({
            owner: discordId
        })

        if (storageExists) {
            response.storage = storageExists

        } else {
            const newStorage = new Storage({
                owner: discordId
            })

            await newStorage.save()
            response.storage = newStorage
        }

    } catch (e) {
        console.log(e)
        response.error = true
        response.query = `there was an error, please try again later :pensive:`

    }

    return response
}

const formatItemsFromStorage = (listItems) => {
    let query = ""

    listItems.sort((itemOne, itemTwo) => {
        if (itemOne.name > itemTwo.name) return 1
        if (itemOne.name < itemTwo.name) return -1
        return 0

    })

    if (listItems.length <= 0) {
        query = 'you have 0 items.'
    } else {
        listItems.forEach((item) => {
            query += ` ${item.name} x${item.count} ($${item.price})\n`
        })
    }

    return query
}

const formatEquipmentsFromStrorage = (listEquipments) => {
    let query = ""

    listEquipments.sort((itemOne, itemTwo) => {
        if (itemOne.name > itemTwo.name) return 1
        if (itemOne.name < itemTwo.name) return -1
        return 0

    })

    if (listEquipments.length <= 0) {
        query = 'you have 0 equipments.'
    } else {
        listEquipments.forEach((equipment) => {
            query += `${equipment.name} (Attack +${equipment.bonusStats.attack} / Defense +${equipment.bonusStats.defense} / Health + ${equipment.bonusStats.health})\n`
        })
    }

    return query
}

const Storage = mongoose.model('Storage', storageSchema)

module.exports = {
    Storage,
    getStorage,
    formatItemsFromStorage,
    formatEquipmentsFromStrorage
}