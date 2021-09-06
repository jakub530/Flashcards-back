const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const Set = require('../src/models/set')
const log = require('../src/log')
const {mockCard, mockSet, mockSession} = require('./fixtures/mock.js')
const { Users, Sessions, newSets, Sets, newCards, newSessions,Cards, setupDatabase} = require('./fixtures/db')

test('Should create a mock set', async () => {
  const {set, cards} = await mockSet(3, Users[0]._id, "public", 20)
  console.log(cards)
  console.log(set)

})

