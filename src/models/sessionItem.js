const mongoose = require('mongoose')

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
    bucket:1,
    history:[],
  }).save()

  return newSessionItem
}


const SessionItem = mongoose.model('SessionItem', sessionItemSchema)

module.exports = SessionItem