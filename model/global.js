const mongoose = require('mongoose');

const globalSchema = mongoose.Schema({
    acceptedRules: {
        type: [String]
    },
    lastChartReset: Date
});

module.exports = mongoose.model('global', globalSchema, 'global');