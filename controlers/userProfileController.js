const User = require("../models/userModel");
const { findUserByEmail } = require("../services/userService");
const bcrypt = require("bcrypt");
const { validateUser } = require("../utils/validators/usersValidator");
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ApiError("only images", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadUserImage = upload.single("image");
const resizeImage = asyncHandler(async (req, res, next) => {
  if (req.files.image) {
  const filename = ` user-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/users/${filename}`);
    //.toFile(`../../Angular/E-commerce-Angular/src/assets/images/users/${filename}`);

  req.body.image = filename;
  }
  next();
});

const getCurrentUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).send("incorrect email");
    }

    res.send(user);
  } catch (error) {
    console.log(error.message);
  }
};

const updateCurrentUserProfile = async (req, res) => {
  try {
    const { error, value } = validateUser(req.body);
    if (error) {
      res.status(400).send({ message: "Invalid form field.." });
      return;
    }

    const user = req.user;
    if (!user) {
      return res.status(404).send("incorrect email");
    }

    if (value.password) {
      const passwordHash = await bcrypt.hash(value.password, 10);
      await User.updateOne({ email }, { passwordHash });
    }

    await User.updateOne({ email: user.email }, req.body);
    const updatedUser = await findUserByEmail(user.email);
    res.send(updatedUser);
  } catch (error) {
    res.status(404).send("Invalid request" + error.message);
    return;
  }
};
const updatePassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = User.findUserByEmail(email);
    if (!user) {
      return res.status(404).send("incorrect email");
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    await User.updateOne({ email }, { passwordHash });

    //const updatedUser = await findUserByEmail(user.email);
    res.send({ message: "updated" });
  } catch (error) {
    res.status(404).send("Invalid request" + error.message);
    return;
  }
};

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadUserImage,
  resizeImage,
  updatePassword,
};
