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
      ref:'sessionItem',      
    },
    currentBucket: {
      type:Number
    },
    currentCount: {
      type:Number
    },
    itemFlag: {
      type: String,
      enum: ['correct','false','pending'],
    },
    bucketLevels: [{
      type:Number  
    }]
  },
  sets: [
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:Set
    }
  ],
  settings: {
    buckets: {
      type:Number,
      default:5
    }
  }
}, {
    timestamps: true,
})

sessionSchema.virtual('sessionItems', {
  ref: 'SessionItem',
  localField: '_id',
  foreignField: 'session'
})



sessionSchema.methods.initializeSessionState = async function(sessionItems)
{
  const session = this;
  session.state.currentBucket = 1;
  session.state.currentItem = sessionItems[Math.floor(Math.random()*sessionItems.length)];
  session.state.currentCount = 0
  session.state.itemFlag = "pending"
  session.state.bucketLevels = [sessionItems.length, ...Array(session.settings.buckets).fill(0)]
  await session.save()

  return session;
}

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session