const express = require("express");
const {
  getcategoryValidator,
  createcategoryValidator,
  updatecategoryValidator,
  deletecategoryValidator,
} = require("../utils/validators/categoryValidator");
const router = express.Router();
const main = require("../controlers/controller");
const productRoute = require("../routs/productRoute");
const subCategoryRoute = require("../routs/subCategoryRoute");
const { auth } = require("../midleWare/auth");
const { isAdmin } = require("../midleWare/Admin");


router.use("/:categoryId/product", productRoute);
router.use("/:categoryId/subcategory", subCategoryRoute);

router.get("/", main.get);
router.get("/:id", getcategoryValidator, main.getId);

router.post(
  "/",
   main.uploadCategoryImage,
   main.resizeImage,
  //createcategoryValidator,
  main.create
);
router.put(
  "/:id",
  // main.uploadCategoryImage,
  // main.resizeImage,
  updatecategoryValidator,
  main.update
);
router.delete("/:id", deletecategoryValidator, main.delete);
module.exports = router;
