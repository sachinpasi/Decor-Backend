const Category = require("../Models/CategoryModel");
const Product = require("../Models/ProductModel");

const SuperPromise = require("../Middlewares/SuperPromise");

exports.CreateCategory = SuperPromise(async (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({
      error: {
        message: "Name is Required",
      },
    });
  }

  const category = new Category(req.body);

  await category.save();

  res.status(200).json({
    success: true,
    category,
  });
});

exports.GetCategoryById = SuperPromise(async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({
      error: {
        message: "Category Id Is Required",
      },
    });
  }
  const category = await Category.findById(req.params.id);

  res.status(200).json({
    success: true,
    category,
  });
});

exports.DeleteCategoryById = SuperPromise(async (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({
      error: {
        message: "Category Id Is Required",
      },
    });
  }
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      error: {
        message: "Category Not Found",
      },
    });
  }

  await category.remove();

  res.status(200).json({
    success: true,
    message: "Category Deleted Successfully",
  });
});

exports.GetAllCategory = SuperPromise(async (req, res, next) => {
  const categories = await Category.find();

  await res.status(200).json({
    success: true,
    categories,
  });
});
