const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const Set = require('../src/models/set')
const Card = require('../src/models/card')
const log = require('../src/log')
const {mockCard, mockSet, mockSession} = require('./fixtures/mock.js')
const { Users, Sessions, newSets, Sets, newCards, newSessions,Cards, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create a mock set', async () => {
  const {set, cards} = await mockSet(3, Users[0]._id, "public", 20)
  // console.log(cards)
  // console.log(set)

})

test('Should create a mock session', async() => {
  const {session, sessionItems, sets} = await mockSession(0, Users[0]._id, 5)
  // console.log(session)
  // console.log(sessionItems)

})

test('Should create a mock session', async() => {
  const {session, sessionItems, sets} = await mockSession(
    0, Users[0]._id, 5,
    { buckets:7 },
    {
      previousItems:[],
      currentBucket:1,
      currentCount:0,
      itemFlag:"pending",
      bucketLevels:[0, 3, 1, 1, 0]
    }
  )
  

})

test('Should test query middleware', async() => {
  const setID = Sets[1]._id
  const set = await Set.findOne({_id:setID})
  // console.log(set)
  await set.deleteOne()

})