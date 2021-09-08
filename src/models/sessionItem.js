const mongoose = require('mongoose')
// const Session = require('./session')

const sessionItemSchema = new mongoose.Schema({
  session: {
    type: String,
    trim: true,
    required:true,
  },
  card: {
    type:String,
    trim: true,
    default: "",
  },
  bucket: {
    type: Number,
    required: true,
  },
  finished: {
    type:Boolean,
    default:false,
  },
  history: [{
    date: {
      type: Date, 
      required:true
    },
    outcome: {
      type: String,
      enum: ['correct','false'],
      required:true  
    }
  }],
}, {
    timestamps: true,
})

sessionItemSchema.statics.initialize = async (sessionId, cardId) => {
  const newSessionItem = await new SessionItem({
    session:sessionId,
    card:cardId,
    bucket:0,
    history:[],
  }).save()

  return newSessionItem
}

sessionItemSchema.methods.addHistoryEntry = function(update) {
  sessionItem = this
  sessionItem.history = [
    ...sessionItem.history,
    {
      outcome:update,
      date:Date.now()
    }
  ]
  return sessionItem;
}

sessionItemSchema.methods.updateBucket = function(session, policy) {
  sessionItem = this
  update = session.state.itemFlag
  bucketCount = session.settings.buckets

  const oldBucket = sessionItem.bucket
  if(update==="correct")
  {
    if(sessionItem.bucket < bucketCount - 1)
    {
      sessionItem.bucket += 1;
    }
    else if(sessionItem.bucket === bucketCount)
    {
      sessionItem.bucket = -1;
      sessionItem.finished = true;
    }
  } else 
  {
    if(!sessionItem.bucket === 1)
    {
      if(policy === "normal")
      {
        sessionItem.bucket -= 1;
      }
    }
  }
  const newBucket = sessionItem.bucket
  session.state.bucketLevels[oldBucket] -= 1
  session.state.bucketLevels[newBucket] += 1

  return  sessionItem;
}

// sessionItemSchema.pre('deleteOne', {document:true}, async function (next) {
//   const sessionItem = this
//   const session = await Session.findOne({_id:sessionItem._id})
//   if(!session)
//   {
//     return;
//   }
//   else
//   {

//   }

// })


const SessionItem = mongoose.model('SessionItem', sessionItemSchema)

module.exports = SessionItem