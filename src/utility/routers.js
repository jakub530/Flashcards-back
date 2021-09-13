const log = require('../log')
const _ = require('lodash')
const mongoose = require('mongoose')

const filterUpdates = (updates, allowedUpdates) => {
  updateKeys = Object.keys(updates)

  const isValidOperation = updateKeys.every((update) => {
    return allowedUpdates.includes(update)
  })
  // log.silly("Valid:", isValidOperation)
  if (!isValidOperation) {
    return {valid:false}
  }

  return {valid:true,updates:updateKeys}
}



// 1. Get list of all cards currently 
const updateCards = async (updates, set) => {
  const newIds = updates.map((e) => e._id) 
  const currentCards = await set.findSetCards()
  const currentCardsIds = currentCards.map((e)=> e._id.toString())

  const idToDelete = _.difference(currentCardsIds, newIds)
  const idToAdd = _.difference(newIds, currentCardsIds)
  const idToUpdate = _.difference(newIds, idToAdd)

  const cardToAdd =   updates.filter((elem) => idToAdd.includes(elem._id))
  const cardToUpdate = updates.filter((elem) => idToUpdate.includes(elem._id))
  console.log("Debug 1")

  console.log("Debug 1.5")
  const cardsToDelete = _.difference(currentCardsIds, idToUpdate)
  console.log("Debug 1.75")
  const insertedCards = await set.insertCards(cardToAdd)
  console.log("Debug 2")
  const deletedCards = await set.deleteCards(idToDelete)
  const updatedCards = await set.updateCards(cardToUpdate)
  console.log("Debug 3")
  return({insertedCards, deletedCards, updatedCards})
}

module.exports = {
  filterUpdates,
  updateCards
}