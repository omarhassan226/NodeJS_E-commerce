const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/error");
const Order = require("../models/orderModel");
const Cart = require("../models/shoppingModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const { config } = require("dotenv");
const stripe = require("stripe")(
  "sk_test_51OnQZAKIG07g9B4OctDoeQ9DVpDCddUwKigshgBDxGHpxVWM89mr2S4mjfAba0f37Egr4M6Rnp5MtjpzOV9JVOmW00zbevruF7"
);

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  try {
    const taxPrice = 0;
    const shiippingPrice = 0;
    // GET cart depend on cartid
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
      return next(
        new ApiError(`There is no cart with this id ${req.params.cartId} `, 404)
      );
      return console.log("error");
    }
    // GET order price depend on cart price "check if copon apply"
    const cartPrice = cart.totalPriceAfterDiscount
      ? cart.totalPriceAfterDiscount
      : cart.price;
    const totalOrderPrice = cartPrice + taxPrice + shiippingPrice;

    // CRETE order with payment
    const order = await Order.create({
      user: cart.user,
      cartItems: cart.items,
      totalOrderPrice,
      ...req.body,
    });

    //after create order decrement product , increment product
    if (order) {
      const bulkOption = cart.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOption, {});
      // clear cart depend on cartid
      await Cart.findByIdAndDelete(req.params.cartId);
    }
    res.status(201).json({ status: "success", data: order });
  } catch (error) {
    return next(
      new ApiError(`There is no cart with this id ${req.params.cartId} `, 404)
    );
  }
});

exports.getOne = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id)
      .populate("user")
      .populate({
        path: "cartItems",
        populate: { path: " productId", model: "Product" },
      });
    if (!order) {
      return next(new ApiError("order not found", 404));
      //return res.status(400).json({ msg: "Category not found" });
    }
    res.status(200).json({ data: order });
  } catch (error) {
    console.log(error.message);
    return next(new ApiError("order not found", 404));
  }
});

exports.getOrders = asyncHandler(async (req, res) => {
  const queryStringObj = { ...req.query };
  const excludesFildes = ["page", "sort", "limit", "fields"];
  excludesFildes.forEach((field) => delete queryStringObj[field]);
  let queryStr = JSON.stringify(queryStringObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;
  const endIndex = page * limit;
  const pagination = {};
  const documentCount = await Order.countDocuments();
  pagination.currentPage = page;
  pagination.limit = limit;
  pagination.numberPages = Math.ceil(documentCount / limit);
  //next page
  if (endIndex < documentCount) {
    pagination.nextPage = page + 1;
  }
  if (skip > 0) {
    pagination.prevPage = page - 1;
  }
  const paginationResult = pagination;
  let mongooseQuery = Order.find(JSON.parse(queryStr))
    .skip(skip)
    .limit(limit)
    .populate({
      path: "cartItems",
      populate: { path: " productId", model: "Product" },
    }); //sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    mongooseQuery = mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery = mongooseQuery.sort("-createAt");
  }
  //fields
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery.select("-__v");
  }
  //search
  if (req.query.keyword) {
    let query = {};
    if (Order.modelName === "Order") {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    } else {
      query = { name: { $regex: req.query.keyword, $options: "i" } };
    }
    mongooseQuery = Order.find(query);
  }
  const Orders = await mongooseQuery;

  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 5;
  // const skip = (page - 1) * limit;
  const orders = await Order.find()
    .populate("user")
    .populate({
      path: "cartItems",
      populate: { path: " productId", model: "Product" },
    });

  res
    .status(200)
    .json({ results: Orders.length, paginationResult, data: orders });
});

exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById({ _id: id });
  if (!order) {
    return next(new ApiError("order not found", 404));
  }
  await Order.deleteOne({ _id: id });

  // return res.status(400).json({ msg: "Category not found" });
  res.status(200).json({ data: order });
});

exports.updateOrderTopaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError("Order Not Found", 404));
  }
  // update order to paid
  order.isPaid = true;
  order.paid = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

exports.updateOrderTodelevred = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError("Order Not Found", 404));
  }
  // update order to delvered
  order.isDelevered = true;
  order.delveredAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({ status: "success", data: updatedOrder });
});

exports.checkOut = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}, 404`)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.price;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // CREATE order with payment
  const order = await Order.create({
    user: cart.user,
    cartItems: cart.items,
    totalOrderPrice,
    ...req.body,
  });

  // Decrement product quantity and increment sold count
  if (order) {
    const bulkOption = cart.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
  }

  const user = await User.findById(cart.user);

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          product_data: { name: "complete payment", description: "-------" },
          unit_amount: totalOrderPrice * 100,
          currency: "egp",
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:4200/thank-you/${order._id}`,
    cancel_url: "http://localhost:4200/cart",

    customer_email: user.email,
    client_reference_id: req.params.cartId,

    // metadata: "jjjjjjj",
  });

  // Remove items from the cart
  await Cart.updateOne(
    { _id: req.params.cartId },
    { $pull: { items: { _id: { $in: cart.items.map((item) => item._id) } } } }
  );

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError("Order Not Found", 404));
  }
  // update order to delvered

  const updatedOrder = await Order.updateOne(
    { _id: req.params.id },
    { status }
  );

  res.status(200).json({ status: "success", data: updatedOrder });
});
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  try {
    //const id = req.params.id;

    const user = req.user;
    const orders = await Order.find({ user: user.id }).populate({
      path: "cartItems",
      populate: { path: " productId", model: "Product" },
    });
    if (!orders) {
      return next({ message: "no orders" });
      //return res.status(400).json({ msg: "Category not found" });
    }
    res.status(200).json({ data: orders });
  } catch (error) {
    //console.log(error.message);
    res.status(404).send({
      message: error.message,
    });
  }
});
exports.getOrdersByStatus = asyncHandler(async (req, res, next) => {
  try {
    const status = req.params.status;
    const orders = await Order.find({ status: status })
      .populate("user")
      .populate({
        path: "cartItems",
        populate: { path: " productId", model: "Product" },
      });
    if (!orders) {
      return next(new ApiError("order not found", 404));
      //return res.status(400).json({ msg: "Category not found" });
    }
    res.status(200).json({ data: orders });
  } catch (error) {
    console.log(error.message);

    return next(new ApiError("order not found", 404));
  }
});
