const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
};
const cooldownSchema = mongoose.Schema({
    userId: reqString,
    guildId: reqString,
    lastDaily: Date,
    lastWater: Date,
    lastGamble: Date,
    lastLottery: Date,
    ticketExpire: Date,
});

module.exports = mongoose.model(
    'cooldown',
    cooldownSchema,
    'cooldown'
)