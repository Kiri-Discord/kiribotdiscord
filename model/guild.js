const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
}

const guildSchema = mongoose.Schema({
    guildID: reqString,
    prefix: {
        type: String,
        default: '>'
    },
    logChannelID: String,
    verifyChannelID: String,
    verifyRole: String,
    ignoreLevelingsChannelID: String,
    enableLevelings: {
        type: Boolean,
        default: false
    },
    verifyTimeout: Number,
    responseType: {
        type: String,
        default: 'natural'
    },
    greetChannelID: String,
    byeChannelID: String
});

module.exports = mongoose.model('Guild', guildSchema, 'guilds');