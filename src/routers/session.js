const express = require('express')
const router = new express.Router()
const mongoose = require('mongoose')
const auth = require('../middleware/auth')
const Session = require('../models/session')
const SessionItem = require('../models/sessionItem')
const Card = require('../models/card')
const {findSessionCards, findAllSessionCards} = require('../utility/routers')

const log = require('../log')

// Create new session
router.post('/session', auth, async (req, res) => {
  const user = req.user

  const sets = req.body.sets
  try {
    const cards = await Card.findSetCards(sets)
    if(cards.length === 0)
    {
      return res.status(400).send("Please add some cards");
    }

    const savedSession = await new Session({
      ...req.body.session, 
      owner:user._id,
      sets
    }).save()

    const sessionItems = await Promise.all(cards.map(async (card) => {
      return sessionItem = await SessionItem.initialize(savedSession._id,card._id)
    }))

    // console.log(sessionItems)
    await savedSession.initializeSessionState(sessionItems);
    // console.log(savedSession);
  
    res.status(200).send(savedSession);
  } catch(e) {
    console.log(e)
    res.status(400).send(e);
  }
})

// Create new session
router.post('/session/evolve/:id', auth, async (req, res) => {
  const user = req.user
  const sessionId = req.params.id
  const update = req.body.update


  try {
    console.log("Looking for session")
    const session = await Session.findOne({ _id:sessionId, owner:user._id })
    console.log("Found session", session)
    const updatedSession = await session.updateState(update);
    console.log("Attempt at updating")
    const cards = await findSessionCards(updatedSession);
    res.status(200).send({session:updatedSession, cards});
  } catch(e) {
    console.log(e)
    res.status(400).send(e);
  }
})


router.get('/session', auth, async (req, res) => {
  const user = req.user
  try {
    const sessions = await Session.find({ owner:user._id })

  
    res.status(200).send(sessions);
  } catch(e) {
    res.status(400).send(e);
  }
})

// Get a signle state and its state
router.get('/session/state/:id', auth, async (req, res) => {
  const user = req.user
  const sessionId = req.params.id
  try {
    console.log("Session ID", sessionId)
    const session = await Session.findOne({ owner:user._id, _id:sessionId })
    console.log("session", session)
    const cards = await findSessionCards(session);
    
    res.status(200).send({session, cards});
  } catch(e) {
    console.log(e)
    res.status(400).send(e);
  }
})

// Delete existing set
router.delete('/session/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
      const session = await Session.findOne({ _id, owner: req.user._id });

      if (!session) {
        return res.status(404).send("Unable to find the session with given id")
      }

      await session.deleteOne();
      res.send(session)
  } catch (e) {
      return res.status(500).send()
  }

})

router.get('/session/cards/:id', auth, async (req, res) => {
  const user = req.user
  const sessionId = req.params.id
  try {
    const sessionCards = await findAllSessionCards(sessionId)
    
    res.status(200).send(sessionCards);
  } catch(e) {
    console.log(e)
    res.status(400).send(e);
  }
})


module.exports = router