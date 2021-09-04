const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
}

const embedsSchema = mongoose.Schema({
    guildID: reqString,
    embeds: {
        type: [Object],
        default: []
    }
});

module.exports = mongoose.model('embeds', embedsSchema, 'embeds');