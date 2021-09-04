const mongoose = require('mongoose')

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
  settings: {
    type: Map
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

userSchema.virtual('sessionItems', {
  ref: 'SessionItem',
  localField: '_id',
  foreignField: 'session'
})

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session