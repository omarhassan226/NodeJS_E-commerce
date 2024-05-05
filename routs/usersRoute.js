const express = require("express");
const app = express();

const { auth } = require("../midleWare/auth");
const { isAdmin } = require("../midleWare/Admin");
const main = require("../controlers/useresController");
const router = express.Router();

router.post(
  "/register",
  // main.resizeImage,
  // main.uploadUserImage,
  main.createUser
);

router.post("/login", main.login);

module.exports = router;
