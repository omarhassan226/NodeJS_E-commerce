const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// eslint-disable-next-line import/newline-after-import
const isAdmin = async (req, res, next) => {
  try {
    // eslint-disable-next-line dot-notation

    const token = req.headers["jwt"];
    if (!token) {
      return res.status(401).send({ message: "unauthorized user" });
    }
    const payload = jwt.verify(token, "jwtSecret");
    const { email } = payload;
    const user = await User.findOne({email});

    if (!user.isAdmin) {
      return res
        .status(401)
        .send({ message: "Forbidden - Admin access required" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send({ message: error.message });
  }
};

module.exports = {isAdmin};
