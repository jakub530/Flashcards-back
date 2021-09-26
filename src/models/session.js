const mongoose = require("mongoose");
const SessionItem = require("./sessionItem");
const log = require("../log");
const newLog = require("../logLevelSetup");

const sessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    state: {
      previousItems: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "sessionItem",
        },
      ],
      currentItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sessionItem",
      },
      currentBucket: {
        type: Number,
      },
      currentCount: {
        type: Number,
      },
      itemFlag: {
        type: String,
        enum: ["correct", "false", "pending", "corrected"],
      },
      bucketLevels: [
        {
          type: Number,
        },
      ],
      noItems: {
        type: Boolean,
        default: false,
      },
    },
    sets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Set,
      },
    ],
    settings: {
      buckets: {
        type: Number,
        default: 5,
      },
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.virtual("sessionItems", {
  ref: "SessionItem",
  localField: "_id",
  foreignField: "session",
});

sessionSchema.methods.initializeSessionState = async function (sessionItems) {
  const session = this;
  session.state.currentBucket = 0;
  session.state.currentItem =
    sessionItems[Math.floor(Math.random() * sessionItems.length)];
  session.state.currentCount = 0;
  session.state.itemFlag = "pending";
  session.state.bucketLevels = [
    sessionItems.length,
    ...Array(session.settings.buckets - 1).fill(0),
  ];
  await session.save();

  return session;
};

sessionSchema.methods.getCurrentItem = async function () {
  return await SessionItem.findOne({ _id: this.state.currentItem });
};

sessionSchema.methods.updatePreviousItems = function () {
  session = this;

  // To Do: Think about defining it with setting
  if (session.state.previousItems.length >= 3) {
    session.state.previousItems = session.state.previousItems.slice(1);
  }
  session.state.previousItems.push(session.state.currentItem);
};

sessionSchema.methods.pickBucket = function () {
  session = this;
  session.state.currentCount += 1;
  const oldBucket = session.state.currentBucket;
  // If you had over 20 items from given bucket or bucket is empty change it
  if (
    session.state.currentCount > 20 ||
    session.state.bucketLevels[session.state.currentBucket] === 0
  ) {
    // Find index of all buckets with 10 or more items
    const largeBuckets = session.state.bucketLevels.reduce((a, c, i) => {
      if (c > 10) a.push(i);
      return a;
    }, []);

    if (largeBuckets.length === 0) {
      // If no large buckets are present instead get any bucket
      const filledBuckets = session.state.bucketLevels.reduce((a, c, i) => {
        if (c > 0) a.push(i);
        return a;
      }, []);

      if (filledBuckets.length === 0) {
        // If no buckets are filled it means there are no more items
        session.state.noItems = true;
      } else {
        session.state.currentBucket = filledBuckets[filledBuckets.length - 1];
      }
    } else {
      session.state.currentBucket = largeBuckets[largeBuckets.length - 1];
    }
  } else {
    // No need to change the bucket in this case
  }

  if (session.state.currentBucket !== oldBucket) {
    session.state.currentCount = 0;
  }
};

sessionSchema.methods.selectNewItem = async function () {
  let session = this;

  let nextItem = await SessionItem.findOne({
    session: session._id,
    bucket: session.state.currentBucket,
    _id: {
      $nin: session.state.previousItems,
    },
  });

  if (!nextItem) {
    nextItem = await SessionItem.findOne({
      session: session._id,
      bucket: session.state.currentBucket,
    });
  }

  session.state.currentItem = nextItem;
  session.state.itemFlag = "pending";
  if (session.state.currentItem != null) {
    session.state.previousItems = session.state.previousItems.filter(
      (item) => item.toString() !== session.state.currentItem.toString()
    );
  }

  return nextItem;
};

// This could be invoked in case of changes to the number of items in each bucket
sessionSchema.methods.refreshBucketsCounts = async function () {
  const session = this;
  const sessionItems = await SessionItem.find({
    session: session._id,
    bucket: { $gte: 0 },
  });

  session.state.bucketLevels.fill(0);

  sessionItems.forEach(
    (elem) => (session.state.bucketLevels[elem.bucket] += 1)
  );
  // return await session.save()
};

// This could be invocked in case of decreased number of buckets
sessionSchema.methods.adjustBucketsOfItems = async function () {
  const session = this;
  const sessionItemsHighBucket = await SessionItem.find({
    session: session._id,
    bucket: { $gte: session.settings.buckets },
  });

  await Promise.all(
    sessionItemsHighBucket.map(async (item) => {
      item.bucket = -1;
      item.finished = true;
      await item.save();
    })
  );
};

// Adjust state each time we change content of a give set
sessionSchema.methods.adjustState = async function () {
  const session = this;

  await session.refreshBucketsCounts();

  // First take care of previous items
  await session.adjustPreviousItems();

  // Adjust current bucket
  await session.adjustBucket();

  // Adjust current item
  if (!session.state.noItems) {
    await session.adjustCurrentItem();
    await session.updateOne();
  } else {
    session.state.currentItem = null;
    session.state.previousItems = [];
    session.state.currentBucket = 0;
    session.state.currentCount = 0;
  }
};

sessionSchema.methods.adjustBucket = async function () {
  const session = this;

  const sessionItem = await SessionItem.findOne({
    session: session._id,
    bucket: session.state.currentBucket,
  });

  if (session.state.currentBucket >= session.settings.buckets || !sessionItem) {
    session.pickBucket();
  }
};

sessionSchema.methods.adjustPreviousItems = async function () {
  const session = this;

  const previousItems = await SessionItem.find({
    id: {
      $in: session.state.previousItems,
    },
  });
  if (!previousItems) {
    return;
  }
  const previousIds = previousItems.map((elem) => elem._id);
  session.state.previousItems = previousIds;
};

sessionSchema.methods.adjustCurrentItem = async function () {
  const session = this;
  const currentItem = await SessionItem.findOne({
    id: session.state.currentItem,
  });

  if (!currentItem) {
    const nextItem = await session.selectNewItem();
  }
};

sessionSchema.methods.updateState = async function (update) {
  const session = this;
  if (
    update === "next" &&
    (session.state.itemFlag == "correct" ||
      session.state.itemFlag == "corrected")
  ) {
    await session.proceedToNextItem(update);
  } else {
    await session.updateCurrentItem(update);
  }

  return session;
};

sessionSchema.methods.updateCurrentItem = async function (update) {
  let session = this;
  let sessionItem = await session.getCurrentItem();
  if (session.state.itemFlag === "pending") {
    if (update === "correct" || update === "false") {
      session.state.itemFlag = update;
      sessionItem = sessionItem.addHistoryEntry(update);
    }
  }
  if (session.state.itemFlag === "false" && update === "correct") {
    session.state.itemFlag = "corrected";
  }
  await session.save();
  await sessionItem.save();
};

sessionSchema.methods.proceedToNextItem = async function () {
  let session = this;
  let sessionItem = await session.getCurrentItem();
  // To Do: think of a way of calling bucket update policies
  // Don't hardcode bucket update policy
  sessionItem = await sessionItem.updateBucket(session, "normal");
  session.updatePreviousItems();
  session.pickBucket();
  if (!session.state.noItems) {
    await session.selectNewItem();
  } else {
    session.state.currentItem = null;
  }
  await session.save();
  await sessionItem.save();
};

sessionSchema.pre("deleteOne", { document: true }, async function (next) {
  const session = this;
  await SessionItem.deleteMany({ session: session._id });
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
