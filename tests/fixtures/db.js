const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Set = require('../../src/models/set')
const Card = require('../../src/models/card')
const Session = require('../../src/models/session')
const SessionItem = require('../../src/models/sessionItem')
const log = require('../../src/log')

const userIDs = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId()
]

const Users = [
  {
    _id: userIDs[0],
    name: 'Mike',
    email: 'mike@example.com',
    password: '56what!!!',
    tokens: [{
      token: jwt.sign({_id: userIDs[0]}, process.env.JWT_SECRET)
    }]
  },
  {
    _id: userIDs[1],
    name: 'Stefan',
    email: 'stefan@example.com',
    password: 'hispassword123!',
    tokens: [{
      token: jwt.sign({_id: userIDs[1]}, process.env.JWT_SECRET)
    }]
  },
  {
    _id: userIDs[2],
    name: 'Artur',
    email: 'artur@example.com',
    password: 'thisismypassword',
    tokens: [{
      token: jwt.sign({_id: userIDs[2]}, process.env.JWT_SECRET)
    }]
  }
]

const newUsers = [{
  name: "John Kowalski",
  email: "jakub530@gmail.com",
  password: "MyPass777"
}]

const setIDs = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
]

const Sets = [
  {
    _id: setIDs[0],
    name: "My first set",
    description: "This is my first set",
    owner: userIDs[0],
    access:"private",
    settings:{}
  },
  {
    _id: setIDs[1],
    name: "German Set (public)",
    description: "This is my set",
    owner: userIDs[1],
    access:"public",
    settings:{}
  },
  {
    _id: setIDs[2],
    name: "Spanish Set (private)",
    description: "I like my set",
    owner: userIDs[1],
    access:"private",
    settings:{}
  },
  {
    _id: setIDs[3],
    name: "New public set",
    description: "I like my set",
    owner: userIDs[2],
    access:"public",
    settings:{}
  },
]

const newSets = [
  {
    name: "My first new set",
    description: "This is test description",
    access:"private",
    settings:{}
  },  
  {
    name: "My second new set",
    access:"private",
    settings:{}
  }
]

const cardIDs = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),  
]

const Cards = [
  {
    _id: cardIDs[0],
    term:"Term 1",
    definition:"Definition 1",
    set:setIDs[0]
  },
  {
    _id: cardIDs[1],
    term:"Term 2",
    definition:"Definition 2",
    set:setIDs[0]
  },
  {
    _id: cardIDs[2],
    term:"Term 3",
    definition:"Definition 3",
    set:setIDs[0]
  },
  {
    _id: cardIDs[3],
    term:"Term 4",
    definition:"Definition 4",
    set:setIDs[0]
  },
  {
    _id: cardIDs[4],
    term:"Term 5",
    definition:"Definition 5",
    set:setIDs[1]
  },
  {
    _id: cardIDs[5],
    term:"Term 6",
    definition:"Definition 6",
    set:setIDs[1]
  },
  {
    _id: cardIDs[6],
    term:"Term 7",
    definition:"Definition 7",
    set:setIDs[1]
  },
  {
    _id: cardIDs[7],
    term:"Term 8",
    definition:"Definition 8",
    set:setIDs[2]
  },
  {
    _id: cardIDs[8],
    term:"Term 9",
    definition:"Definition 9",
    set:setIDs[2]
  },
]

const newCards = [
  {
    term:"New term 1",
    definition:"Definition 1",
  },
  {
    term:"New Term 2",
    definition:"Definition 2",
  },
  {
    term:"New Term 3",
    definition:"Definition 3",
  }
]

const sessionID = [
  new mongoose.Types.ObjectId(),
]

const sessionItemIDs = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId(),
] 

const Sessions = [
  {
    _id:sessionID[0],
    name:"Session Name",
    description:"Session Description",
    owner:userIDs[1],
    state: {
      bucketLevels: [ 5, 0, 0, 0, 0 ],
      currentBucket: 0,
      currentItem: sessionItemIDs[0],
      currentCount: 0,
      itemFlag: 'correct'
    },
    sets: [
      setIDs[1],
      setIDs[2]
    ],
    settings: { buckets: 5 },
  }
]

const newSessions = [
  {
    name:"My Session",
    description:"Test description",
  }
]



const SessionItems = [
  {
    _id: sessionItemIDs[0],
    session:sessionID[0],
    bucket:0,
    card:cardIDs[4],
    history:[]
  },
  {
    _id: sessionItemIDs[1],
    bucket:0,
    session:sessionID[0],
    card:cardIDs[5],
    history:[]
  },
  {
    _id: sessionItemIDs[2],
    bucket:0,
    session:sessionID[0],
    card:cardIDs[6],
    history:[]
  },
  {
    _id: sessionItemIDs[3],
    bucket:0,
    session:sessionID[0],
    card:cardIDs[7],
    history:[]
  },
  {
    _id: sessionItemIDs[4],
    bucket:0,
    session:sessionID[0],
    card:cardIDs[8],
    history:[]
  },
]

const setupDatabase = async() => {
  await User.deleteMany()
  await Set.deleteMany()
  await Card.deleteMany()
  await Session.deleteMany()
  await SessionItem.deleteMany()

  // Save all users to the database
  const savedUsers = await Promise.all(Users.map(async (user) => {
    return savedUser = await new User(user).save()
  }))

  const savedSets = await Promise.all(Sets.map(async (set) => {
    return savedSet = await new Set(set).save()
  }))

  const savedCards = await Promise.all(Cards.map(async (card) => {
    return savedCard = await new Card(card).save()
  }))

  const savedSessions = await Promise.all(Sessions.map(async (session) => {
    return savedSession = await new Session(session).save()
  }))

  const savedSessionItems = await Promise.all(SessionItems.map(async (sessionItem) => {
    return savedSessionItem = await new SessionItem(sessionItem).save()
  }))
}

module.exports = {
  Users,
  newUsers,
  Sets,
  newSets,
  Cards,
  newCards,
  Sessions,
  newSessions,
  setupDatabase
}