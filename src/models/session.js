const mongoose = require('mongoose')
const Set = require('./set')
const Card = require('./card')
const log = require('../log')

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required:true,
  },
  definition: {
    type:String,
    trim: true,
    default: "",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  state: {
    currentItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:'sessionItem',      
    },
    currentBucket: {
      Number
    },
    currentCount: {
      Number
    },
    itemFlag: {
      type: String,
      enum: ['public','private'],
      default: 'private'  
    },
    bucketCount: [
      Number  
    ]
  },
  next_item: {
    type: Map
  },
  sets: [{
    set: {
      type:mongoose.Schema.Types.ObjectId,
      ref:Set
    }
  }]
}, {
    timestamps: true,
})

sessionSchema.virtual('sessionItems', {
  ref: 'SessionItem',
  localField: '_id',
  foreignField: 'session'
})

sessionSchema.statics.initializeSessionItems = async function(setIds) {
  const session = this;
  const cards = await Card.find({
    'set': { $in: setIds}
  })

  // TO DO: Need to create a session item for each of the cards here

  return 
}

sessionSchema.method.initializeSessionState = async function()
{
  const session = this;
  // TO DO: Need to initalize session state in here
}

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session