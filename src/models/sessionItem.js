const mongoose = require("mongoose");
// const Session = require('./session')

const sessionItemSchema = new mongoose.Schema(
  {
    session: {
      type: String,
      trim: true,
      required: true,
    },
    card: {
      type: String,
      trim: true,
      default: "",
    },
    bucket: {
      type: Number,
      required: true,
    },
    finished: {
      type: Boolean,
      default: false,
    },
    history: [
      {
        date: {
          type: Date,
          required: true,
        },
        outcome: {
          type: String,
          enum: ["correct", "false"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

sessionItemSchema.statics.initialize = async (sessionId, cardId) => {
  const newSessionItem = await new SessionItem({
    session: sessionId,
    card: cardId,
    bucket: 0,
    history: [],
  }).save();

  return newSessionItem;
};

sessionItemSchema.methods.addHistoryEntry = function (update) {
  sessionItem = this;
  sessionItem.history = [
    ...sessionItem.history,
    {
      outcome: update,
      date: Date.now(),
    },
  ];
  return sessionItem;
};

sessionItemSchema.methods.updateBucket = async function (session, policy) {
  sessionItem = this;
  update = session.state.itemFlag;
  console.log("Update is ", update);
  bucketCount = session.settings.buckets;

  const oldBucket = sessionItem.bucket;
  if (update === "correct") {
    if (sessionItem.bucket < bucketCount - 1) {
      sessionItem.bucket += 1;
    } else if (sessionItem.bucket === bucketCount - 1) {
      sessionItem.bucket = -1;
      sessionItem.finished = true;
    }
  } else {
    if (sessionItem.bucket !== 0) {
      if (policy === "normal") {
        sessionItem.bucket -= 1;
        console.log("Reduced bucket");
      }
    }
  }
  const newBucket = sessionItem.bucket;
  session.state.bucketLevels[oldBucket] -= 1;
  session.state.bucketLevels[newBucket] += 1;
  console.log("Old Bucket", oldBucket);
  console.log("New Bucket", newBucket);

  return sessionItem.save();
};

const SessionItem = mongoose.model("SessionItem", sessionItemSchema);

module.exports = SessionItem;
