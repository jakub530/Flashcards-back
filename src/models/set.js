const mongoose = require('mongoose')
const Card = require('./card')
const log = require('../log')

const setSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type:String,
    trim: true,
    default: "",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:'User',
  },
  access: {
    type: String,
    enum: ['public','private'],
    default: 'private'
  },
  settings: {
    type: Map
  }
}, {
    timestamps: true,
})

setSchema.virtual('cards', {
  ref: 'Card',
  localField: '_id',
  foreignField: 'set'
})

// setSchema.virtual('sessions', {
//   ref: 'Session',
//   localField: '_id',
//   foreignField: 'sets'
// })

setSchema.methods.findSetCards = async function () {
  const set = this
  const cards = await Card.find({ set: set._id});
  // log.silly("Cards", cards)
  
  return cards 
} 

setSchema.methods.insertCards = async function(cards) {
  const set = this
  
  if(!cards)
  {
    return null;
  }

  cards.forEach((elem) => {
    elem.set = set._id;
  })
  const insertedCards = await Card.insertMany(cards)

  return insertedCards;
}

setSchema.methods.updateCards = async function(cards) {
  const set = this
  
  const updates = await Promise.all(cards.map(async ({_id, term,definition}) => {
    log.silly("UPDATE ID", _id)
    log.silly("UPDATE term", term)
    log.silly("UPDATE definition", definition)
    return await Card.replaceOne({_id},{term, definition, set})
  }))

  log.silly("Updates", updates)

  return updates
}

setSchema.methods.deleteCards = async function(cardIds = null) {
  const set = this

  if(!cardIds) {
    const cards = await set.findSetCards();
    log.silly("Cards", cards)
    cardIds = cards.map(elem=>elem._id);
  }
  log.silly("Card ids", cardIds)

  deletedCards = await Card.deleteMany({
    _id:{
      $in:cardIds
    }
  })
  log.silly("deletedCards", deletedCards)
  return deletedCards
}

const Set = mongoose.model('Set', setSchema)

module.exports = Set