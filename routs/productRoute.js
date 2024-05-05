const express = require("express");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");
const { auth } = require("../midleWare/auth");
const { isAdmin } = require("../midleWare/Admin");
const router = express.Router({ mergeParams: true });
const main = require("../controlers/productController");
router.get("/", main.get);
router.get("/:id", getProductValidator, main.getId);
router.post(
  "/",
  isAdmin,
  main.uploadProductImage,
  main.resizeImage,
  //createProductValidator,
  main.create
);
router.put(
  "/:id",
  isAdmin,
  main.uploadProductImage,
  main.resizeImage,
  updateProductValidator,
  main.update
);
router.delete("/:id", isAdmin, deleteProductValidator, main.delete);
module.exports = router;
