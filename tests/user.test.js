const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { Users, newUsers, setupDatabase } = require('./fixtures/db')


beforeEach(setupDatabase)

test('Should signup a new user', async () => {
  const newUser = newUsers[0]
  const response = await request(app).post('/users').send(newUser).expect(201)

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertion about the response
  expect(response.body).toMatchObject({
    user: {
      name: newUser.name,
      email: newUser.email,
    },
    token: user.tokens[0].token
  })

  expect(user.password).not.toBe(newUser.password)
})

test('Should login existing user', async () => {
  const fixUser = Users[0]
  const response = await request(app).post('/users/login').send({
      email: fixUser.email,
      password: fixUser.password
  }).expect(200)

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertion about the response
  expect(response.body).toMatchObject({
      user: {
          name: fixUser.name,
          email: fixUser.email,
      },
      token: user.tokens[1].token
  })
  expect(user.password).not.toBe(fixUser.password)
})

test('Should not login nonexistent user', async () => {
  const newUser = newUsers[0]
  await request(app).post('/users/login').send({
    email: newUser.email,
    password: newUser.password
  }).expect(400)
})

test('Should get profile for user', async () => {
  const fixUser = Users[0]
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unathorized user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async() => {
  const fixUser = Users[0]
  const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send()
    .expect(200)

  // Ensure that the user was deleted
  const user = await User.findById(response.body._id)
  expect(user).toBeNull()
})

test('Should not delete account for unathenticated', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should update valid user fields', async () => {
  const fixUser = Users[0]
  const newName = "Zbigniew"

  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send({name:newName})
    .expect(200)

  // Assert that the database was changed correctly
  const user = await User.findById(response.body._id)
  expect(user.name).toBe(newName)
})

test('Should not update invalid user field', async () => {
  const fixUser = Users[0]

  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send({location:"London"})
    .expect(400)
})
