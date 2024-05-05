// eslint-disable-next-line import/newline-after-import
const express = require("express");
const app = express();
const {
  getCurrentUserShoppingCart,
  addBProductsToshoppingCart,
  updatProductInShoppingCart,
  deleteProductInShoppingCart,
  clearCart,
} = require("../controlers/shoppingCart");
// eslint-disable-next-line import/newline-after-import
const { auth } = require("../midleWare/auth");
const router = express.Router();

router.use(auth);
router.get("/", auth, getCurrentUserShoppingCart);
router.post("/", auth, addBProductsToshoppingCart);
router.patch("/update/:productId",auth, updatProductInShoppingCart);
router.delete("/remove/:productId", auth,deleteProductInShoppingCart);
router.delete("/clear",auth, clearCart);
module.exports = router;
