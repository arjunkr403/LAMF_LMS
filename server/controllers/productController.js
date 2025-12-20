import LoanProduct from "../models/LoanProduct.js";

// @desc    Fetch all loan products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const products = await LoanProduct.find({});
  res.json(products);
};

// @desc    Create a loan product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, type, maxLTV, interestRate, minLoanAmount, maxLoanAmount } =
    req.body;

  const product = new LoanProduct({
    name,
    type,
    maxLTV,
    interestRate,
    minLoanAmount,
    maxLoanAmount,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

export { getProducts, createProduct };
