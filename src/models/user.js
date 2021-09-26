const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Set = require("./set");
const Session = require("./session");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length < 7) {
          throw new Error("Password has to be at least 7 characters long");
        }
        if (value === "password") {
          throw new Error("Password cannot be 'password'");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("sets", {
  ref: "Set",
  localField: "_id",
  foreignField: "owner",
});

// Check if user exists, and has given correct password
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return user;
};

// Delete private fields before sending response
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

// Generate auth token for user
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Hash the plain text password before sending
userSchema.pre("save", async function (next) {
  const user = this; // Syntax only

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Delete user tasks when user is removed
userSchema.pre("deleteOne", { document: true }, async function (next) {
  const user = this;
  const sets = await Set.find({ owner: user._id });
  const sessions = await Session.find({ owner: user._id });

  await Promise.all(
    sets.map(async ({ _id }) => {
      set = await Set.findOne({ _id });
      await set.deleteOne();
    })
  );

  await Promise.all(
    sessions.map(async ({ _id }) => {
      session = await Session.findOne({ _id });
      await session.deleteOne();
    })
  );
});

const User = mongoose.model("User", userSchema);

module.exports = User;
