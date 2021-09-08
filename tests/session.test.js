const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const Set = require('../src/models/set')
const { Users, Sessions, newSets, Sets, newCards, newSessions,Cards, setupDatabase} = require('./fixtures/db')
const log = require('../src/log')

beforeEach(setupDatabase)

test('Should create new session', async () => {
  const fixUser = Users[0]
  const newSession = newSessions[0]

  const response = await request(app)
  .post('/session')
  .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
  .send({session:newSession, sets:[Sets[1]._id,Sets[2]._id]})
  .expect(200)

})

test('Should fail to create session without sets', async () => {
  const fixUser = Users[0]
  const newSession = newSessions[0]

  const response = await request(app)
  .post('/session')
  .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
  .send({session:newSession})
  .expect(400)

  expect(response.error.text).toBe("Please add some cards")
})


test('Should evolve session correctly', async () => {
  const fixUser = Users[1]
  const newSession = newSessions[0]
  const fixSession = Sessions[0]

  const response = await request(app)
  .post(`/session/evolve/${fixSession._id}`)
  .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
  .send({update:"next"})
  .expect(200)

  // console.log(response.body.state)
})