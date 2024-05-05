// eslint-disable-next-line import/newline-after-import
const express = require("express");
const router = express.Router();

const controllers = require("../controlers/userProfileController");

const { isAdmin } = require("../midleWare/Admin");
const { auth } = require("../midleWare/auth");

router.get(
  "/",
  auth,
  controllers.getCurrentUserProfile
);
router.patch(
  "/password",
  controllers.updatePassword
);
router.patch(
  "/",
  auth,
  // controllers.resizeImage,
  // controllers.uploadUserImage,
  controllers.updateCurrentUserProfile
);


module.exports = router;
