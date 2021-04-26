const { Storage, getStorage } = require('../../model/storage')

const prices = {
    attack: 5000,
    defense: 3500,
    health: 2000,
    sword: {
        price: 5000,
    },
    armor: {
        price: 5000
    }
}

const items = [
    {
        name: 'Diamond-Sword',
        type: 'Sword',
        price: prices.sword.price,
        bonusStats: {
            attack: 25,
            defense: 5,
            health: 5,
        },
        requiredObjects: [{
            name: 'Iron',
            amount: 15,
        }, {
            name: 'Coal',
            amount: 15,

        }, {
            name: 'Diamond',
            amount: 3
        }, {
            name: 'Ruby',
            amount: 1
        }]
    },

    {
        name: 'Iron-Sword',
        type: 'Sword',
        price: prices.sword.price,
        bonusStats: {
            attack: 30,
            defense: 0,
            health: 0,
        },
        requiredObjects: [{
            name: 'Iron',
            amount: 10,
        }, {
            name: 'Coal',
            amount: 10,

        }, {
            name: 'Diamond',
            amount: 5
        }, {
            name: 'Ruby',
            amount: 1
        }]
    },

    {
        name: 'Diamond-Armor',
        type: 'Armor',
        price: prices.armor.price,
        bonusStats: {
            attack: 0,
            defense: 20,
            health: 25,
        },
        requiredObjects: [{
            name: 'Iron',
            amount: 20,
        }, {
            name: 'Coal',
            amount: 20,

        }, {
            name: 'Gold',
            amount: 3
        }, {
            name: 'Diamond',
            amount: 2
        }, {
            name: 'Emerald',
            amount: 1
        }]
    },

    {
        name: 'Iron-Armor',
        type: 'Armor',
        price: prices.armor.price,
        bonusStats: {
            attack: 0,
            defense: 40,
            health: 50,
        },
        requiredObjects: [ {
            name: 'Ruby',
            amount: 5,
        }, {
            name: 'Gold',
            amount: 5
        }, {
            name: 'Diamond',
            amount: 5
        }, {
            name: 'Emerald',
            amount: 5
        }]
    }
]

const buyFromStore = async (user, itemPrice, query) => {
    let messageToSend = ""

    const storage = await Storage.findOne({
        owner: user._id
    })

    if (storage) {
        const currentMoney = storage.money

        if (currentMoney < itemPrice) {
            messageToSend = `${user.at}, you don't have enough money to buy it!`
        } else {
            storage.money -= itemPrice
            messageToSend = query
        }

        await storage.save()

    } else {
        const newStorage = await new Storage({
            owner: user._id
        })

        await newStorage.save()
        messageToSend = `${user.at}, you don't have enough money!`
    }

    return messageToSend
}

const canUserBuyItem = async (user, item) => {
    const response = await getStorage(user)
    const storage = response.storage

    if (!response.error && storage) {

        const foundItem = items.find((itemTemp) => itemTemp.name.toLowerCase() === item.toLowerCase())

        if (foundItem) {
            const userItems = storage.items
            const userMoney = storage.money

            const foundItems = foundItem.requiredObjects.filter((object) => {
                return userItems.find((userItem) => userItem.name === object.name && userItem.count >= object.amount)

            })

            if ((foundItems.length === foundItem.requiredObjects.length) && (userMoney >= foundItem.price)) {
                try {
                    for (let i = 0; i < foundItems.length; i++) {

                        for (let j = 0; j < userItems.length; j++) {

                            if (foundItems[i].name === userItems[j].name) {
                                const newItem = userItems[j]
                                newItem.count -= foundItems[i].amount
                                storage.items.push(newItem)
                                storage.items.splice(j, 1)

                                break
                            }
                        }
                    }

                    const equipment = {
                        ...foundItem,
                        equiped: false,
                    }
                    delete equipment.requiredObjects

                    storage.waifuEquipments.push(equipment)
                    storage.money -= equipment.price

                    await storage.save()
                    response.query = `${user.at}, you have bought ${item}`

                } catch (e) {
                    console.log(e)
                    response.query = `${user.at}, something went wrong please try again later!`

                }

            } else {
                response.query = `${user.at}, you cannot buy this item!`
            }

        } else {
            response.query = `${user.at}, that's not a valid item!`
        }
    }

    return response
}

const sellItems = async (user, itemName, quantity) => {

    let query = ""
    const storageResponse = await getStorage(user)

    if (!storageResponse.error) {
        const storage = storageResponse.storage
        const foundItem = storage.items.find((tempItem) => tempItem.name.toLowerCase() === itemName.toLowerCase())

        if (foundItem) {

            if (quantity <= foundItem.count) {
                const money = (foundItem.price * quantity)
                const newItem = {
                    ...foundItem,
                    count: foundItem.count - quantity
                }
                
                for(let i = 0; i < storage.items.length; i++) {
                    if (storage.items[i].name.toLowerCase() === itemName.toLowerCase()){
                        storage.items.splice(i, 1)
                    }
                }
                
                storage.money += money
                storage.items.push(newItem)
                await storage.save()

                query = `${user.at}. you have received ${money}$!`
                
            } else {
                query = `${user.at}. you dont have that much ${itemName}!`

            }
  
        } else {
            query = `${user.at}. you don't own that item!`
            
        }


    } else {
        query = `${user.at}. there's been a problem, try again later!`

    }

    return query
}

const formatRequiredObjects = (requirementsList) => {

    let query = ""

    if (requirementsList.length <= 0) {
        query = `No item requirement`

    } else {

        requirementsList.forEach((item) => {
            query += `${item.name} x${item.amount} \n`
        })
    }

    return query
}

const formatStats = (stats) => {
    return `(Attack +${stats.attack} / Defense +${stats.defense} / Health +${stats.health})`
}

module.exports = {
    prices,
    items,
    buyFromStore,
    canUserBuyItem,
    formatRequiredObjects,
    formatStats,
    sellItems
}
