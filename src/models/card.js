const mongoose = require("mongoose");
const SessionItem = require("./sessionItem");

const cardSchema = new mongoose.Schema(
  {
    term: {
      type: String,
      trim: true,
      default: "",
    },
    definition: {
      type: String,
      trim: true,
      default: "",
    },
    set: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Set",
    },
  },
  {
    timestamps: true,
  }
);

cardSchema.virtual("sessionItems", {
  ref: "SessionItem",
  localField: "_id",
  foreignField: "card",
});

cardSchema.statics.findSetCards = async (setIds) => {
  const cards = await Card.find({
    set: {
      $in: setIds,
    },
  });

  return cards;
};

cardSchema.methods.toJSON = function () {
  const card = this;
  const cardObject = card.toObject();

  delete cardObject.set;

  return cardObject;
};

cardSchema.pre("deleteMany", async function (next) {
  if (Object.keys(this.getQuery()).length !== 0) {
    const cardIds = await Card.find(this.getQuery(), "_id");
    const cardList = cardIds.map((elem) => elem._id);
    const sessionItems = await SessionItem.deleteMany({
      card: {
        $in: cardList,
      },
    });
  }
});

cardSchema.pre("deleteOne", { document: true }, async function (next) {
  const card = this;
  const sessionItems = await SessionItem.deletOne({ card: card._id });
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
