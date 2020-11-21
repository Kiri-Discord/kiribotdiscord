const mongoose = require('mongoose');

const verifySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    userID: String,
    code: String
});

module.exports = mongoose.model('verify', verifySchema, 'verify');