const User = require("../models/userModel");

const createNewUser = async ({ name, email, image,passwordHash, isAdmin }) => {
  try {
    return await User.create({ name, email, image,passwordHash, isAdmin });
  } catch (error) {
    return error;
  }
};

// eslint-disable-next-line arrow-body-style
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};
// eslint-disable-next-line arrow-body-style
const findAllUsers = async () => {
  return await User.find();
};

module.exports = {
  createNewUser,
  findUserByEmail,
  findAllUsers,
};