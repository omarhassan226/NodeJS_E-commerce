const express = require("express");
const {
  getBrandyValidator,
  createBrandyValidator,
  updateBrandyValidator,
  deleteBrandyValidator,
  // eslint-disable-next-line import/newline-after-import
} = require("../utils/validators/brandValidator");
const router = express.Router();
const main = require("../controlers/brandController");

router.get("/", main.get);
router.get("/:id", getBrandyValidator, main.getId);
router.post(
  "/",
  main.uploadBrandImage,
  main.resizeImage,
  createBrandyValidator,
  main.create
);
router.put(
  "/:id",
  main.uploadBrandImage,
  main.resizeImage,
  updateBrandyValidator,
  main.update
);
router.delete("/:id", deleteBrandyValidator, main.delete);
module.exports = router;
