// eslint-disable-next-line import/newline-after-import
const express = require("express");
const router = express.Router();

const controllers = require("../controlers/reviews");
const { auth } = require("../midleWare/auth");
const { isAdmin } = require("../midleWare/Admin");

router.get("/:id/reviews", controllers.getProductReviews);
router.post("/:id/ratings", auth, controllers.addProductRating);
router.post("/:id/reviews", auth, controllers.addProductReviews);
router.delete("/:id/reviews", auth, controllers.deleteProductReviews);
router.patch("/:id/reviews", auth, controllers.editProductReviews);

module.exports = router;
