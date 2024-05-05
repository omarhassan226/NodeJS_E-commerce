const {
  findCurrentUserShoppingCart,
  createCartService,
} = require("../services/shoppingCartService");
const ShoppingCart = require("../models/shoppingModel");
const User = require("../models/userModel");
const { findUserByEmail } = require("../services/userService");
const { findProductById } = require("../services/productService");
const asyncHandler = require("express-async-handler");

const getCurrentUserShoppingCart = async (req, res) => {
  try {
    // const  email = req.headers.email;
    // const user =await findUserByEmail(email);
    const userCart = await findCurrentUserShoppingCart(req.user.id);
    if (!userCart) {
      res.status(404).json("the cart with given Current user was not found");
      return;
    }
    res.json(userCart);
  } catch (error) {
    res.status(500).json({ error: "Error getting shopping cart" + error });
  }
};
const addBProductsToshoppingCart = async (req, res) => {
  try {
    let { productId, quantity } = req.body;
    //console.log(quantity);
    // const  email = req.headers.email;
    // const findUser = await findUserByEmail(email)
    // const user= findUser._id
    let mess = "";
    const user = req.user;
    let userCart = await findCurrentUserShoppingCart(user.id);
    if (!userCart) {
      const product = await findProductById(productId);
      if (quantity > product.quantity) {
        quantity = product.quantity;
        mess = `there is only ${existingItem.productId.quantity} in the stock`;
      }
      await createCartService({
        user: user.id,
        items: [{ productId, quantity }],
      });
      const newuserCart = await findCurrentUserShoppingCart(user.id);
      let totalPrice = 0;
      newuserCart.items.forEach((item) => {
        // const book = await findBookById(item.bookId);
        totalPrice += item.productId.price * item.quantity;
      });
      newuserCart.price = totalPrice;
      await newuserCart.save();
      return res.json({
        message: "Product added to cart successfully",
        newuserCart,
      });
    } else {
      const existingItem = userCart.items.find((item) =>
        item.productId.equals(productId)
      );

      if (existingItem) {
        // const product = await findProductById(productId);
        if (
          existingItem.quantity + quantity >
          existingItem.productId.quantity
        ) {
          existingItem.quantity = existingItem.productId.quantity;
          mess = `there is only ${existingItem.productId.quantity} in the stock`;
        } else {
          existingItem.quantity += quantity;
        }
      } else {
        const product = await findProductById(productId);
        if (quantity > product.quantity) {
          quantity = product.quantity;
        }
        userCart.items.push({ productId, quantity });
        await userCart.save();
        userCart = await findCurrentUserShoppingCart(req.user);
      }
      let totalPrice = 0;
      userCart.items.forEach((item) => {
        totalPrice += item.productId.price * item.quantity;
      });
      userCart.price = totalPrice;
      await userCart.save();
    }
    res.json({
      message: "Product added to cart successfully " + mess,
      userCart,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message + "  Error getting shopping cart" });
  }
};

const updatProductInShoppingCart = asyncHandler(async (req, res, next) => {
  try {
    // const  email = req.headers.email;
    // const findUser = await findUserByEmail(email)
    // const user= findUser._id

    const user = req.user;
    const { productId } = req.params;
    const { quantity } = req.body;
    const userCart = await findCurrentUserShoppingCart(user.id);
    if (!userCart) {
      res.status(404).json("The cart for the current user was not found");
      return;
    }
    const itemToUpdate = userCart.items.find((item) =>
      item.productId.equals(productId)
    );
    const itemIndex = userCart.items.findIndex((item) =>
      item.productId.equals(productId)
    );

    if (!itemToUpdate) {
      res
        .status(404)
        .json("The item with the given ID was not found in the cart");
      return;
    }
    if (quantity > itemToUpdate.productId.quantity) {
      itemToUpdate.quantity = itemToUpdate.productId.quantity;
    } else {
      itemToUpdate.quantity = quantity;
    }
    let totalPrice = 0;
    userCart.items[itemIndex] = itemToUpdate;
    userCart.items.forEach((item) => {
      totalPrice += item.productId.price * item.quantity;
    });
    userCart.price = totalPrice;

    await userCart.save();
    const updated = userCart;

    await ShoppingCart.findOneAndUpdate({ _id: userCart._id }, updated, {
      new: true,
    });

    res.json({ message: "Product quantity updated successfully", userCart });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating product quantity" + error.message });
  }
});
const deleteProductInShoppingCart = async (req, res) => {
  try {
    // const  email = req.headers.email;
    // const findUser = await findUserByEmail(email)
    // const user= findUser._id

    const user = req.user;
    const { productId } = req.params;
    let userCart = await findCurrentUserShoppingCart(user.id);
    if (!userCart) {
      res.status(404).json("The cart for the current user was not found");
      return;
    }
    const itemIndex = userCart.items.findIndex((item) => {
      return item.productId._id.toString() === productId;
    });
    console.log(itemIndex);

    if (itemIndex == -1) {
      res
        .status(404)
        .json("The item with the given ID was not found in the cart");
      return;
    }
    userCart.items = userCart.items.filter(
      (item) => !item.productId.equals(productId)
    );
    // const cart = await ShoppingCart.findOneAndUpdate(
    //   { user: req.user._id },
    //   { $pull: { cartItemSchema: { _id: req.params.itemId } } },
    //   { new: true }
    // );

    let totalPrice = 0;
    userCart.items.forEach((item) => {
      //console.log(item)
      totalPrice += item.productId.price * item.quantity;
    });
    userCart.price = totalPrice;
    await userCart.save();
    res.json({ message: "Item deleted from cart successfully", userCart });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    // const  email = req.headers.email;
    // const findUser = await findUserByEmail(email)
    // const user= findUser._id

    const user = req.user;

    const userCart = await findCurrentUserShoppingCart(user.id);
    if (!userCart) {
      res.status(404).json("The cart for the current user was not found");
      return;
    }
    userCart.items = [];

    userCart.price = 0;

    await userCart.save();

    res.json({ message: "Item deleted from cart successfully", userCart });
  } catch (error) {
    res.status(500).json({ error: "Error deleting product quantity" });
  }
};

module.exports = {
  getCurrentUserShoppingCart,
  addBProductsToshoppingCart,
  updatProductInShoppingCart,
  deleteProductInShoppingCart,
  clearCart,
};
