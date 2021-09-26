const log = require("../log");
const _ = require("lodash");
const mongoose = require("mongoose");
const Card = require("../models/card");
const SessionItem = require("../models/sessionItem");
const Set = require("../models/set");
const Session = require("../models/session");

const filterUpdates = (updates, allowedUpdates) => {
  updateKeys = Object.keys(updates);

  const isValidOperation = updateKeys.every((update) => {
    return allowedUpdates.includes(update);
  });
  // log.silly("Valid:", isValidOperation)
  if (!isValidOperation) {
    return { valid: false };
  }

  return { valid: true, updates: updateKeys };
};

// 1. Get list of all cards currently
const updateCards = async (updates, set) => {
  const newIds = updates.map((e) => e._id);
  const currentCards = await set.findSetCards();
  const currentCardsIds = currentCards.map((e) => e._id.toString());

  const idToDelete = _.difference(currentCardsIds, newIds);
  const idToAdd = _.difference(newIds, currentCardsIds);
  const idToUpdate = _.difference(newIds, idToAdd);

  const cardToAdd = updates.filter((elem) => idToAdd.includes(elem._id));
  const cardToUpdate = updates.filter((elem) => idToUpdate.includes(elem._id));
  console.log("Debug 1");

  console.log("Debug 1.5");
  console.log("Debug 1.75");
  const insertedCards = await set.insertCards(cardToAdd);
  console.log("Debug 2");
  const deletedCards = await set.deleteCards(idToDelete);
  const updatedCards = await set.updateCards(cardToUpdate);
  console.log("Debug 3");
  return { insertedCards, deletedCards, updatedCards };
};

const findCardOfSessionItem = async (sessionItemId) => {
  const sessionItem = await SessionItem.findOne({ _id: sessionItemId });
  const card = await Card.findOne({ _id: sessionItem.card });
  return card;
};

const findAllSessionCards = async (sessionId) => {
  console.log("Session ID", sessionId);
  const session = await Session.findOne({ _id: sessionId });
  console.log("Session", session);
  console.log("Session Sets", session.sets);

  const sets = await Set.find({ _id: { $in: session.sets } });
  const setMap = sets.reduce(
    (acc, curr) => ((acc[curr._id] = curr.name), acc),
    {}
  );
  console.log(setMap);
  const sessionItems = await SessionItem.find({ session: sessionId });
  const sessionCards = await Promise.all(
    sessionItems.map(async (item) => {
      const card = await findCardOfSessionItem(item._id);
      // console.log("Item", item)
      // console.log(item.history)
      // const data = item
      // data.term = card.term
      // data.definition = card.definition
      // data.set = setMap[card.set]
      return {
        finished: item.finished,
        history: item.history,
        bucket: item.bucket,
        term: card.term,
        definition: card.definition,
        set: setMap[card.set],
      };
    })
  );

  return sessionCards;
};

const findSessionCards = async (session) => {
  let currentCard;
  if (session.state.currentItem != null) {
    currentCard = await findCardOfSessionItem(session.state.currentItem);
  } else {
    currentCard = {};
  }

  console.log("find Session Cards:", session.state.currentItem);
  // console.log("find Session Cards:", currentCard)
  const previousCards = [];
  if (session.state.previousItems.length > 0) {
    for (const id of session.state.previousItems) {
      const previousCard = await findCardOfSessionItem(id);
      previousCards.push(previousCard);
    }
  }

  return { currentCard, previousCards };
};

module.exports = {
  filterUpdates,
  updateCards,
  findSessionCards,
  findAllSessionCards,
};
