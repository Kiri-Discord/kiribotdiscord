const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
}

const guildSchema = mongoose.Schema({
    guildID: reqString,
    prefix: {
        type: String,
        default: 'k!'
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
    byeChannelID: String,
    levelings: {
        type: Object,
        default: {
            destination: null,
            content: {
                type: 'plain',
                content: '{auto}'
            }
        }
    },
    greetContent: {
        type: Object,
        default: {
            type: 'plain',
            content: '{auto}'
        }
    },
    byeContent: {
        type: Object,
        default: {
            type: 'plain',
            content: '{auto}'
        }
    }
});

module.exports = mongoose.model('Guild', guildSchema, 'guilds');
