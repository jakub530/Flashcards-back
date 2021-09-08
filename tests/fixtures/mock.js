const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Set = require('../../src/models/set')
const Card = require('../../src/models/card')
const Session = require('../../src/models/session')
const SessionItem = require('../../src/models/sessionItem')
const log = require('../../src/log')
const _ = require('lodash')

const mockSet = async (setNum ,owner, access, cardCount) => {
  const setId = new mongoose.Types.ObjectId();
  
  const set =  {
    _id: setId,
    name: `Set nr:${setNum}`,
    description: `This is set nr:${setNum}`,
    owner: owner,
    access:access,
    settings:{}
  }

  const savedSet = await new Set(set).save()

  let cards = []
  for (let cardNum = 0; cardNum< cardCount;cardNum++)
  { 
    let card = await mockCard(cardNum,setNum, set);
    cards.push(card)
  }

  return {set:savedSet, cards}
}

const mockSession = async (
  sessionNum, 
  owner, 
  itemCount, 
  settings={
    buckets:5
  }, 
  state={
    previousItems:[],
    currentBucket:0,
    currentCount:0,
    itemFlag:"pending",
    bucketLevels:[itemCount, 0, 0, 0, 0]
  }, 
  setSettings={
    count:1, 
    spread:[itemCount]
  },
  topCard={
    finished:false,
    history:[],
}) => {
  // Firstly create mock sets
  const sessionId = new mongoose.Types.ObjectId();

  let sets = []
  for(let setNum = 0; setNum < setSettings.count; setNum++)
  {
    let {set} = await mockSet(setNum ,owner, "public", 0)
    sets.push(set)
  }

  const session =  {
    _id: sessionId,
    name: `Session nr:${sessionNum}`,
    description: `This is session nr:${sessionNum}`,
    owner: owner,
    state: state,
    sets:sets.map(el => el._id),
    settings:settings
  }

  let buckets = [...state.bucketLevels]
  let sessionItems = []
  let chosenTopCard = false
  let chosenTopCardS2 = false
  for(let setNum = 0; setNum < setSettings.count; setNum++)
  {
    for(let cardNum =0;cardNum < setSettings.spread[setNum]; cardNum++)
    {
      let bucketIndex = buckets.findIndex(elem => elem > 0)
      buckets[bucketIndex] --
      if(!chosenTopCard && bucketIndex===state.currentBucket)
      {
        finished = topCard.finished
        history = topCard.history
        chosenTopCard = true
      }
      else
      {
        finished = false,
        history = []
      }
      const sessionItem = await mockSessionItem(
        cardNum, 
        setNum, 
        session,
        sets[setNum],
        bucketIndex,
        finished,
        history
      )
      if(!chosenTopCardS2 && chosenTopCard)
      {
        chosenTopCardS2 = true;
        session.state.currentItem = sessionItem._id
      }
      sessionItems.push(sessionItem)

    }
  }

  const savedSession = await new Session(session).save()

  return {session:savedSession,sessionItems,sets};
}

const mockSessionItem = async (cardNum, setNum, session, set, bucket=0, finished = false, history = []) => {

  const card = await mockCard(cardNum, setNum,set);

  const sessionItem = {
    session:session._id,
    card:card._id,
    bucket,
    finished,
    history,
  }

  const savedSessionItem = await new SessionItem(sessionItem).save()
  return savedSessionItem;
}

const mockCard = async (cardNum,setNum, set) => {
  const cardId = new mongoose.Types.ObjectId();

  const card = {
    _id: cardId,
    term:`Term ${cardNum}`,
    definition:`Definition ${cardNum} of set ${setNum}`,
    set:set._id
  }

  const savedCard = await new Card(card).save()
  return savedCard;
}

module.exports = {
  mockCard,
  mockSet,
  mockSession,
}