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
    const set = await Set.findOne({
      $or: [
        {access:"public", _id}, 
        {owner:req.user._id, _id}
      ]
    })

    if (!set) {
      return res.status(404).send("Unable to find the set with given id")
    }
    const cards = await set.findSetCards();

    res.send({set,cards})
  } catch (e) {
    return res.status(500).send(e)
  }
})


// Update the set and the cards included in the set
router.patch('/sets/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const set = await Set.findOne({ _id, owner: req.user._id })
    if(req.body.set)
    {
      allowedUpdates = ["name", "description"]
      const updates = filterUpdates(req.body.set, ["name", "description"])
      if(updates=="invalid")
      {
        return res.status(400).send({error:'Invalid updates!'})
      }

      if(updates)
      {
        updates.forEach((update) => set[update] = req.body.set[update])
        await set.save()
      }

    }

    
    const cardUpdates = await updateCards(req.body.cards,set)
    res.status(200).send({set,cards:cardUpdates});
  } catch(e) {
    res.status(400).send(e);
  }
})

// Delete existing set
router.delete('/sets/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
      const set = await Set.findOne({ _id, owner: req.user._id });

      if (!set) {
        return res.status(404).send("Unable to find the set with given id")
      }


      const deletedCards = await set.deleteCards()
      const setResponse = await Set.deleteOne({_id:set._id})
      res.send({set:setResponse, cards:deletedCards})
  } catch (e) {
      return res.status(500).send()
  }

})

module.exports = router