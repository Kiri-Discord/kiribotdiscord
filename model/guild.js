const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
    guildID: String,
    guildName: String,
    prefix: String,
    logChannelID: String,
    verifyChannelID: String,
    verifyRole: String,
    ignoreLevelingsChannelID: String,
    enableLevelings: Boolean,
    verifyTimeout: Number,
});

module.exports = mongoose.model('Guild', guildSchema, 'guilds');
