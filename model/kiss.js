const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const kissSchema = mongoose.Schema({
  userId: reqString,
  guildId: reqString,
  received: {
    type: Number,
    default: 0,
  },
})

module.exports = mongoose.model(
  'kiss-sefy',
  kissSchema,
  'kiss-sefy'
);