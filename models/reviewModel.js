// eslint-disable-next-line import/newline-after-import
const mongoose = require("mongoose");
const reviewSchema = mongoose.Schema({
  reviewDetails: {
    type: String,
    minLength: 3,
    maxLength: 50,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
},
  rating:{
    type:Number,
    min:0,
    max:5
  }
});

const Review = mongoose.model("Review", reviewSchema); //make collection in database and and do the constrains of the schema on the object of the js

module.exports = Review;
