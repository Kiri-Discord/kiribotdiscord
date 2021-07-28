const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true,
};
const gardenSchema = mongoose.Schema({
    userId: reqString,
    guildId: reqString,
    plantOne: String,
    plantTwo: String,
    plantThree: String,
    plantOneStage: {
        type: String,
        default: '0'
    },
    plantTwoStage: {
        type: String,
        default: '0'
    },
    plantThreeStage: {
        type: String,
        default: '0'
    },
});

module.exports = mongoose.model(
    'garden',
    gardenSchema,
    'garden'
)