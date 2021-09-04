const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type:String,
    unique: true,
    required: true,
    trim: true,
    lowercase:true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if(value < 0) {
        throw new Error('Age must be a positive number')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim:true,
    validate(value) {
      if(value.length < 7) {
        throw new Error("Password has to be at least 7 characters long")
      }
      if(value==="password") {
        throw new Error("Password cannot be 'password'")
      }
    }
  },
  tokens: [{
    token: {
      type:String, 
      required: true
    }
  }]
}, {
    timestamps: true,
})

// userSchema.virtual('tasks', {
//     ref: 'Task',
//     localField: '_id',
//     foreignField: 'owner'
// })

// Check if user exists, and has given correct password
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email})

  if (!user) {
    throw new Error('Unable to login')
  }
  const isMatch = await bcrypt.compare(password, user.password)
  
  if(!isMatch) {
    throw new Error('Unable to login')
  }
  return user;
}

// Delete private fields before sending response
userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  return userObject;
}

// Generate auth token for user
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET)
  
  user.tokens = user.tokens.concat({ token})
  await user.save()
  
  return token 
} 

// Hash the plain text password before sending
userSchema.pre('save', async function (next) {
  const user = this // Syntax only
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

// Delete user tasks when user is removed 
// userSchema.pre('remove', async function (next) {
//     const user = this 
//     await Task.deleteMany({ owner: user._id })

//     next()
// })

const User = mongoose.model('User', userSchema)

module.exports = User