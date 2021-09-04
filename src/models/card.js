const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
  term: {
    type: String,
    trim: true,
    default: "",
  },
  definition: {
    type:String,
    trim: true,
    default: "",
  },
  set: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Set'
  },
}, {
    timestamps: true,
})

cardSchema.virtual('sessionItems', {
  ref: 'SessionItem',
  localField: '_id',
  foreignField: 'card'
})

cardSchema.methods.toJSON = function () {
  const card = this
  const cardObject = card.toObject()

  delete cardObject.set

  return cardObject;
}

const Card = mongoose.model('Card', cardSchema)

module.exports = Card