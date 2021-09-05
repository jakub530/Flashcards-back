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
  const {cards, set} =  req.body
  const userId = req.user._id

  try {
    set.owner = userId;
    const newSet = new Set(set)
    await newSet.save()
    
    const insertedCards = await newSet.insertCards(cards)

    res.status(201).send({set:newSet, cards:insertedCards});
  } catch(e) {
    res.status(400).send(e);
  }
})

// Copy set to your new set
router.post('/sets/copy/:id', auth, async (req, res) => {
  const _id = req.params.id


  try {
    const setToCopy = await Set.findById(_id);
    if(!setToCopy)
    {
      return res.status(400).send("Unable to find the set with given id")    
    }
    if(setToCopy.access ==="private" || setToCopy.owner._id.equals(req.user._id))
    {
      return res.status(400).send("Unable to copy this set")
    }
    const cardsToCopy = await setToCopy.findSetCards()

    const newSet = setToCopy
    newSet.owner = req.user._id;
    newSet._id = mongoose.Types.ObjectId();
    newSet.isNew = true;
    newSet.access = "private";

    const createdSet = await newSet.save()

    cardsToCopy.forEach((elem) => {
      elem.set = createdSet._id;
      elem._id = mongoose.Types.ObjectId();
      elem.isNew = true;
    })
    const insertedCards = await createdSet.insertCards(cardsToCopy)

  
    res.status(200).send({set:createdSet, cards:insertedCards});
  } catch(e) {
    res.status(400).send(e);
  }
})

// Get all sets (public or not can be controlled by flag)
router.get('/sets', auth, async (req, res) => {
  const access = req.body.access
  let sets

  try {
    switch(access) {
      case "public":
        sets = await Set.find({access:"public", owner:{$ne:req.user._id}})
        break;
      case "all":
        sets = await Set.find({
          $or: [
            {access:"public"}, 
            {owner:{$ne:req.user._id}}
          ]
        })
        break;
      default:
        sets = await Set.find({owner:req.user._id})
        break;
    }

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
          return res.status(404).send("Unable to find set")
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