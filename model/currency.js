const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true,
}

const moneySchema = mongoose.Schema({
    userId: reqString,
    guildId: reqString,
    balance: {
        type: Number,
        default: 10,
    },
    inventory: {
        type: Object,
        default: {
            rings: 0,
            seeds: 0,
            worms: 0
        }
    },
    garden: {
        type: Object,
        default: {
            plant1: null,
            plant2: null,
            plant3: null,
            plant1Stage: "0",
            plant2Stage: "0",
            plant3Stage: "0",
        }
    },
    lastDaily: Date,
    lastWater: Date,
    lastGamble: Date
});

module.exports = mongoose.model(
    'money',
    moneySchema,
    'money'
)