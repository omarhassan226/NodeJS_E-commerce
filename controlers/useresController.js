const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const {
  createNewUser,
  findUserByEmail,
  findAllUsers,
} = require("../services/userService");

const { validateNewUser } = require("../utils/validators/usersValidator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const getAllUsers = async (req, res) => {
  const users = await findAllUsers();
  res.send(users);
};

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
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/users/${filename}`);

  req.body.image = filename;
  next();
});

const createUser = async (req, res) => {
  try {
    const { error, value } = validateNewUser(req.body);
    if (error) {
      res.status(400).send({ message: "Invalid form field.." });
      return;
    }

    const passwordHash = await bcrypt.hash(value.password, 10);
    const name = value.name;
    const email = value.email;
    const isAdmin = value.isAdmin;
    const image = value.image;

    const userFind = await findUserByEmail(email);
    if (userFind) {
      return res.send({
        message: "This Email Already Exist, Please Enter Another Email",
      });
    }

    const newUser = await createNewUser({
      name,
      email,
      image,
      passwordHash,
      isAdmin,
    });

    return res.send(newUser);
  } catch (error) {
    res.status(500).send(userLoginError.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || Object.keys(req.body).length !== 2) {
      return res
        .status(400)
        .send({ message: "Error: Enter only Email and Password" });
    }
    const user = await findUserByEmail(email);

    //const isValidPassword= await bcrypt.compare(password,user.passwordHash)
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).send({ message: "Incorrect Email or Password" });
    }
    const role = user.isAdmin ? "admin" : "user";
    const token = jwt.sign({ email }, "jwtSecret", { expiresIn: "1h" });
    res
      .header({ jwt: token })
      .send({ message: "Access Granted", email, token: token, role: role });
    // res.send(token)
  } catch (userLoginError) {
    res.status(500).send(userLoginError.message);
  }
};

module.exports = {
  createUser,
  login,
  getAllUsers,
  uploadUserImage,
  resizeImage,
};
