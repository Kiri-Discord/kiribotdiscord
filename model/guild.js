const mongoose = require('mongoose');
const config = require('../config.json');

const reqString = {
    type: String,
    required: true,
};

const guildSchema = mongoose.Schema({
    guildID: reqString,
    prefix: {
        type: String,
        default: config.prefix
    },
    logChannelID: String,
    ignoreLevelingsChannelID: String,
    enableLevelings: {
        type: Boolean,
        default: false
    },
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