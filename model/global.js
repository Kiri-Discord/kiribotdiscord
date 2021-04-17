const mongoose = require('mongoose');

const globalSchema = mongoose.Schema({
    acceptedRules: {
        type: [String]
    },
});

module.exports = mongoose.model('global', globalSchema, 'global');