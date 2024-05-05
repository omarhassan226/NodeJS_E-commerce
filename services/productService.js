const Product = require("../models/productModel");

const findAllproducts = async () => {
  return await Product.find().populate("category");
};

const findProductById = async (_id) => {
  return await Product.findOne({ _id });
};
const findProductByName = async (productName) => {
  return Product.findOne({ productName });
};

const createNewProduct = async (
  productName,
  category,
  description,
  price,
  quantity
) => {
  return await Product.create({
    productName,
    category,
    description,
    price,
    quantity,
  });
};

const UpdateProductService = async (_id, body) => {
  return Product.updateOne({ _id }, body);
};
const deleteOneProductService = async (_id, body) => {
  return await Product.deleteOne({ _id });
};

// const deleteAllProductsService= async()=>{
//     return await Product.deleteMany()
// }

module.exports = {
  createNewProduct,
  findProductById,
  findAllproducts,
  findProductByName,
  UpdateProductService,
  deleteOneProductService,
};
