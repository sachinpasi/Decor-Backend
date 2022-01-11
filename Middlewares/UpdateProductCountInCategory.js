const Category = require("../Models/CategoryModel");

exports.UpdateProductCountInCategory = async (req, res, next) => {
  const category = await Category.findById(req.body.category);
  await Category.findByIdAndUpdate(
    req.body.category,
    {
      productCount: category.productCount + 1,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  next();
};
