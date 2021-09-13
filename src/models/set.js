const mongoose = require('mongoose')
const Card = require('./card')
const Session = require('./session')
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

setSchema.methods.findSetCards = async function () {
  const set = this
  const cards = await Card.find({ set: set._id});
  
  return cards 
} 

setSchema.methods.insertCards = async function(cards) {
  const set = this
  
  if(!cards)
  {
    return null;
  }
  console.log("Inserting Cards")
  cards.forEach((elem) => {
    elem.set = set._id;
  })
  console.log(cards)
  let insertedCards;
  try {
    insertedCards = await Card.insertMany(cards)
  } catch(e) {
    console.log(e)
  }

  console.log("inSerting many cards")
  return insertedCards;
}

setSchema.methods.updateCards = async function(cards) {
  const set = this
  
  const updates = await Promise.all(cards.map(async ({_id, term,definition}) => {
    return await Card.replaceOne({_id},{term, definition, set})
  }))

  return updates
}

setSchema.methods.deleteCards = async function(cardIds = null) {
  const set = this

  if(!cardIds) {
    const cards = await set.findSetCards();
    cardIds = cards.map(elem=>elem._id);
  }

  deletedCards = await Card.deleteMany({
    _id:{
      $in:cardIds
    }
  })
  return deletedCards
}

setSchema.pre('deleteOne', {document:true}, async function (next) {
  const set = this
  await Card.deleteMany({set:set._id})
  const sessions = await Session.find({
    "sets":set._id
  })
  // log.silly("Me testing deleting","Deleteing one set");


  await Promise.all(sessions.map(async (session) => {
    session.sets = session.sets.filter((session_set) => {
      return session_set !== set._id
    })
    await session.adjustState()
    
  }))
})

const Set = mongoose.model('Set', setSchema)

module.exports = Set