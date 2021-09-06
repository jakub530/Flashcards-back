const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Set = require('../../src/models/set')
const Card = require('../../src/models/card')
const Session = require('../../src/models/session')
const SessionItem = require('../../src/models/sessionItem')
const log = require('../../src/log')

const mockSet = async (setNum ,owner, access, cardCount) => {
  const setId = new mongoose.Types.ObjectId();
  
  const set =  {
    _id: setId,
    name: `Set  nr:${setNum}`,
    description: `This is set nr:${setNum}`,
    owner: owner,
    access:access,
    settings:{}
  }

  const savedSet = await new Set(set).save()

  let cards = []
  for (let cardNum =0; cardNum< cardCount;cardNum++)
  { 
    let card = await mockCard(cardNum,setNum, setId);
    cards.push(card)
  }

  return {set:savedSet, cards}
}

const mockSession = async () => {



}

const mockCard = async (cardNum,setNum, set) => {
  const cardId = new mongoose.Types.ObjectId();

  const card = {
    _id: cardId,
    term:`Term ${cardNum}`,
    definition:`Definition ${cardNum} of set ${setNum}`,
    set:set
  }

  const savedCard = await new Card(card).save()
  return savedCard;
}

module.exports = {
  mockCard,
  mockSet,
  mockSession,
}