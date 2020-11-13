
const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const hugSchema = mongoose.Schema({
  userId: reqString,
  guildId: reqString,
  received: {
    type: Number,
    default: 0,
  },
})

module.exports = mongoose.model(
  'hug-sefy',
  hugSchema,
  'hug-sefy'
)