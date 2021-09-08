const express = require('express')
const router = new express.Router()
const mongoose = require('mongoose')
const auth = require('../middleware/auth')
const Session = require('../models/session')
const SessionItem = require('../models/sessionItem')
const Card = require('../models/card')

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
  
    res.status(200).send();
  } catch(e) {
    res.status(400).send(e);
  }
})

// Create new session
router.post('/session/evolve/:id', auth, async (req, res) => {
  const user = req.user
  const sessionId = req.params.id
  const update = req.body.update


  try {
    const session = await Session.findOne({ _id:sessionId, owner:user._id })
    const updatedSession = await session.updateState(update);
  
    res.status(200).send(updatedSession);
  } catch(e) {
    res.status(400).send(e);
  }
})



module.exports = router