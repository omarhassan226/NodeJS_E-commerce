// eslint-disable-next-line import/no-extraneous-dependencies
const { string } = require("joi");
// eslint-disable-next-line import/newline-after-import
const { mongoose } = require("mongoose");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 255,
  },
  passwordHash: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 1024,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: "",
    maxLength: 255,
  }
});
const User = mongoose.model("User", userSchema);
module.exports = User;
