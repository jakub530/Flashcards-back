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
  const [cardsToUpdate,newCards] = _.partition(updates,elem => elem["_id"])
  const IdsToUpdate = cardsToUpdate.map((e) => e._id)
  const currentCards = await set.findSetCards()
  const currentCardsIds = currentCards.map((e)=> e._id.toString())
  const cardsToDelete = _.difference(currentCardsIds, IdsToUpdate)

  const insertedCards = await set.insertCards(newCards)
  const deletedCards = await set.deleteCards(cardsToDelete)
  const updatedCards = await set.updateCards(cardsToUpdate)

  

  // log.silly("newCards", newCards)
  // log.silly("existingCards", cardsToUpdate)
  // log.silly("existingIds", IdsToUpdate)
  // log.silly("currentCards", currentCards)
  // log.silly("currentCardsIds", currentCardsIds)
  // log.silly("cardsToDelete", cardsToDelete)

  // console.log("insertedCards", insertedCards)
  // console.log("deletedCards", deletedCards)
  // console.log("updatedCards", updatedCards)

  return({insertedCards, deletedCards, updatedCards})
}

module.exports = {
  filterUpdates,
  updateCards
}