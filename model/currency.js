const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true,
};

const moneySchema = mongoose.Schema({
    userId: reqString,
    guildId: reqString,
    balance: {
        type: Number,
        default: 0,
    },
    win: {
        type: Number,
        default: 0
    },
    lose: {
        type: Number,
        default: 0
    },
    matchPlayed: Number
});

module.exports = mongoose.model(
    'money',
    moneySchema,
    'money'
)