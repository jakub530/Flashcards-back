const express = require('express')
const router = new express.Router()
const mongoose = require('mongoose')
const auth = require('../middleware/auth')
const Set = require('../models/set')
const Card = require('../models/card')
const log = require('../log')
const {filterUpdates, updateCards} = require('../utility/routers')

// Create new set
router.post('/sets', auth, async (req, res) => {
  const {cards, settings, name, description, access} =  req.body
  const userId = req.user._id

  log.silly("Cards:",cards)
  log.silly("Settings",settings)
  log.silly("Name",name)
  log.silly("Description",description)
  log.silly("Access",access)

  try {
    const set = new Set({name, description, owner:userId, settings, access})
    await set.save()
    log.silly("Saved Set:",set)
    
    const insrtedCards = await set.insertCards(cards)

    log.silly("Inserted Cards", insrtedCards)
    res.status(200).send();
  } catch(e) {
    res.status(400).send(e);
  }
})

// Copy set to your new set
// Needs to check if document exists, then has to check 
// if it is public and probably? if it belongs to another user
// Given all of those you can copy it and then subsequently copy all 
// of the cards
router.post('/sets/copy', auth, async (req, res) => {
  const {id} = req.body

  const set = await Set.findById(id);
  log.silly("Owner", set.owner._id)
  log.silly("User",  req.user._id)

  if(!set)
  {
    log.silly("Not found a set with this ID")
  } else if(set.access ==="private")
  {
    log.silly("Can't copy private set")
  }
  else if(set.owner._id.equals(req.user._id))
  {
    log.silly("Can't copy your own document")
  }
  else
  {
    set.owner = req.user._id;
    set._id = mongoose.Types.ObjectId();
    set.isNew = true;
    set.access = "private";

    const new_set = await set.save()
    log.silly("New Set", new_set)

    const cards = await Card.find({ set: id});
    cards.forEach((elem) => {
      elem.set = new_set._id;
      elem._id = mongoose.Types.ObjectId();
      elem.isNew = true;
    })

    const insertedCards = await Card.insertMany(cards)
  }

  try {
    res.status(200).send();
  } catch(e) {
    res.status(400).send(e);
  }


})

// Get all sets (public or not can be controlled by flag)
router.get('/sets', auth, async (req, res) => {
  const access = req.body.access
  let sets
  if(!access)
  {
    log.silly("Access", "No access flag")
    sets = await Set.find({owner:req.user._id})

  } else if(access==="public")
  {
    log.silly("Access", "Only public access")
    sets = await Set.find({access:"public", owner:{$ne:req.user._id}})

  } else if(access==="all")
  {
    log.silly("Access", "All access")
    sets = await Set.find({
      $or: [
        {access:"public"}, 
        {owner:{$ne:req.user._id}}
      ]
    })
  }

  log.silly("Sets", sets)

  try {
    res.status(200).send(sets);
  } catch(e) {
    res.status(400).send(e);
  }
})

// Get single set and its cards
router.get('/sets/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
      const set = await Set.findOne({ _id, owner: req.user._id })
      const cards = await set.findSetCards();

      if (!set) {
          return res.status(404).send()
      }
      res.send({set,cards})
  } catch (e) {
      console.log(e)
      return res.status(500).send()
  }
})

// Modify existing set
// Needs to do 3 things 
// First of all it needs to find all the cards of a given set
// Then it needs to separate incoming cards into two categories with id and without it
// Those with ids will need to be updated (probably in the loop)
// Those without ids will need to be added
// Finally those, which haven't been provided will be deleted 

router.patch('/sets/:id', auth, async (req, res) => {
  const _id = req.params.id
  allowedUpdates = ["name", "description"]
  const updates = filterUpdates(req.body.set, ["name", "description"])
  log.silly("Updates:",updates)
  if(!updates)
  {
    return res.status(400).send({error:'Invalid updates!'})
  }
  
  const set = await Set.findOne({ _id, owner: req.user._id })
  const test = updateCards(req.body.cards,set)

  // try {
    // Update set first
    // const set = await Set.findOne({ _id, owner: req.user._id })
// 
    // const allowedUpdates = ['name', 'description', 'access', 'settings']
// 
    // const isValidOperation = updates.every((update) => {
      // return allowedUpdates.includes(update)
    // })
// 
    // if (!isValidOperation) {
      // return res.status(400).send({error:'Invalid updates!'})
    // }
// 
    // const cards = await set.findSetCards();
// 
    // if (!set) {
        // return res.status(404).send()
    // }
    // res.send({set,cards})
  // } catch (e) {
      // console.log(e)
      // return res.status(500).send()
  // }

  try {
    res.status(200).send();
  } catch(e) {
    res.status(400).send(e);
  }
})

// Delete existing set
router.delete('/sets/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
      const set = await Set.findOne({ _id, owner: req.user._id });
      log.silly("Set", set)

      if (!set) {
        return res.status(404).send()
      }
      // const cards = await set.findSetCards();
      // log.silly("Cards", cards)
      // const cardIds = cards.map(elem=>elem._id);
      // log.silly("Card ids", cardIds)

      const deletedCards = await set.deleteCards()
      await Set.deleteOne({_id:set._id})
      // await Card.deleteMany({
      //   _id:{
      //     $in:cardIds
      //   }
      // })
      res.send({set, deletedCards})
  } catch (e) {
      console.log(e)
      return res.status(500).send()
  }

})

module.exports = router