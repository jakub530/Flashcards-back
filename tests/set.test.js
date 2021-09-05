const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { Users, newSets, Sets, newCards, Cards, setupDatabase} = require('./fixtures/db')
const log = require('../src/log')

beforeEach(setupDatabase)

test('Should save set succesfully', async () => {
  const fixUser = Users[0]
  const newSet = newSets[0]
  const testNewCards = newCards
  const response = await request(app)
    .post('/sets')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send({set:newSet, cards:testNewCards})
    .expect(201)

  const set = response.body.set
  const cards = response.body.cards

  // Check if the set has been created correctly
  log.silly("response set", set) 
  expect(set).toMatchObject(
    newSet
  )

  // Check if cards were created correctly 
  cards.forEach((el,ind) => {
    expect(el).toMatchObject(testNewCards[ind])
  })

  //  Check if it has correct owner 
  expect(set.owner).toBe(fixUser._id.toString())
})

test('Should save set without cards succesfully', async () => {
  const fixUser = Users[0]
  const newSet = newSets[0]
  const response = await request(app)
    .post('/sets')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send({set:newSet})
    .expect(201)

  const set = response.body.set
  const cards = response.body.cards

  // Check if the set has been created correctly
  expect(set).toMatchObject(
    newSet
  )

  // WIthout any cards we expect cards to be null
  expect(cards).toBeNull()

  //  Check if it has correct owner 
  expect(set.owner).toBe(fixUser._id.toString())
})

test('Should not save without authentication', async () => {
  const fixUser = Users[0]
  const newSet = newSets[0]
  const response = await request(app)
    .post('/sets')
    .send({set:newSet})
    .expect(401)
})

test('Should fail to save without name', async () => {
  const fixUser = Users[0]
  const newSet = newSets[0]
  delete newSet.name;
  const response = await request(app)
    .post('/sets')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send({set:newSet})
    .expect(400)
})

// TO DO: Check if items were copied correctly insteaad of relying on response
test('Should copy a set succsesfully', async () => {
  const fixUser = Users[0]
  const setToCopyId = Sets[1]._id

  const response = await request(app)
    .post(`/sets/copy/${setToCopyId}`)
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .expect(200)
})

test('Should fail to copy private set', async () => {
  const fixUser = Users[0]
  const setToCopyId = Sets[2]._id

  const response = await request(app)
    .post(`/sets/copy/${setToCopyId}`)
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .expect(400)

  expect(response.error.text).toBe("Unable to copy this set")
})

test('Should fail to copy when given wrong format of id', async () => {
  const fixUser = Users[0]

  const response = await request(app)
    .post(`/sets/copy/wrongId`)
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .expect(400)
})

test('Should fail to copy when given wrong id', async () => {
  const fixUser = Users[0]

  const response = await request(app)
    .post(`/sets/copy/61339a85d91623c49c73ce67`)
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .expect(400)

  expect(response.error.text).toBe("Unable to find the set with given id")
})

// TO DO: Test set methods - findSetCards, insertCards, updateCardds, deleteCards
// TO DO: Could look below at indentifying exactly which sets I get?

test('Should get all sets for a given user', async () => {
  const fixUser = Users[1];

  const response = await request(app)
    .get('/sets')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .expect(200)

  expect(response.body.length).toBe(2)
})

test('Should get all public sets', async () => {
  const fixUser = Users[0];

  const response = await request(app)
    .get('/sets')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send({access:"public"})
    .expect(200)

  expect(response.body.length).toBe(2)
})

test('Should get both own and public test', async () => {
  const fixUser = Users[1];

  const response = await request(app)
    .get('/sets')
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send({access:"all"})
    .expect(200)

  expect(response.body.length).toBe(3)
})

test('Should get single set and its cards', async () => {
  const fixUser = Users[0];
  const setID = Sets[0]._id;

  const response = await request(app)
    .get(`/sets/${setID}`)
    .set('Authorization', `Bearer ${fixUser.tokens[0].token}`)
    .send({access:"all"})
    .expect(200)

  console.log(response.body)
})



