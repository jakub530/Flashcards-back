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
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
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

const SessionItem = mongoose.model('SessionItem', sessionItemSchema)

module.exports = SessionItem