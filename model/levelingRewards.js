const mongoose = require("mongoose");

const reqString = {
    type: String,
    required: true,
};

const profileSchema = mongoose.Schema({
    guildId: reqString,
    roleId: reqString,
    level: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("levelingRewards", profileSchema);