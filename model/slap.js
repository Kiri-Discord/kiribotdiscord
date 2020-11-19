const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const slapSchema = mongoose.Schema({
  userId: reqString,
  guildId: reqString,
  received: {
    type: Number,
    default: 0,
  },
})

module.exports = mongoose.model(
  'slap-sefy',
  slapSchema,
  'slap-sefy'
)