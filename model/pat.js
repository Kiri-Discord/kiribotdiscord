
const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const patSchema = mongoose.Schema({
  userId: reqString,
  guildId: reqString,
  received: {
    type: Number,
    default: 0,
  },
})

module.exports = mongoose.model(
  'pat-sefy',
  patSchema,
  'pat-sefy'
)