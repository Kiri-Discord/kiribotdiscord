const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
};

const confessSchema = mongoose.Schema({
    userId: reqString,
    guildId: reqString,
    confession: reqString
});

module.exports = mongoose.model(
    'confess',
    confessSchema,
    'confess'
);