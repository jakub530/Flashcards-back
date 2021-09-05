const express = require('express')
const router = new express.Router()
const mongoose = require('mongoose')
const auth = require('../middleware/auth')
const Session = require('../models/session')

const log = require('../log')

// Create new session
router.post('/session', auth, async (req, res) => {
  const user = req.user
  const sets = req.body.sets
  const test = Session.initializeSessionItems(sets)



  try {
    res.status(200).send(sets);
  } catch(e) {
    res.status(400).send(e);
  }
})


module.exports = router