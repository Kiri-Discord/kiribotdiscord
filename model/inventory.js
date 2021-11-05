const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true,
};

const moneySchema = mongoose.Schema({
    userId: reqString,
    guildId: reqString,
    rings: {
        type: Number,
        default: 0,
    },
    seeds: {
        type: Number,
        default: 0
    },
    worms: {
        type: Number,
        default: 0
    },
    eqTicket: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model(
    'inventory',
    moneySchema,
    'inventory'
)