const Product = require("../Models/ProductModel");
const Category = require("../Models/CategoryModel");
const SuperPromise = require("../Middlewares/SuperPromise");
const WhereClause = require("../Utils/WhereClause");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const { validationResult } = require("express-validator");

exports.CreateProduct = SuperPromise(async (req, res, next) => {
  let MainDisplayPhoto;
  let ImagesArray = [];
  if (!req.files.displayPhoto) {
    return res.status(400).json({
      error: {
        message: "Main Display Photo is Required ",
      },
    });
  }

  if (req.files.displayPhoto) {
    let result = await cloudinary.v2.uploader.upload(
      req.files.displayPhoto.tempFilePath,
      {
        folder: "Products-Display-Photo",
        // width: "1920",
        // height: "2880",
      }
    );
    MainDisplayPhoto = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  console.log(req.files);
  if (req.files.photos) {
    if (req.files.photos.constructor === Array) {
      for (let index = 0; index < req.files.photos.length; index++) {
        let result = await cloudinary.v2.uploader.upload(
          req.files.photos[index].tempFilePath,
          {
            folder: "Products-Photos",
            // width: "1920",
            // height: "2880",
          }
        );
        ImagesArray.push({
          id: (await result).public_id,
          secure_url: (await result).secure_url,
        });
      }
    } else {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos.tempFilePath,
        {
          folder: "products",
          // width: "1920",
          // height: "2880",
        }
      );
      ImagesArray.push({
        id: (await result).public_id,
        secure_url: (await result).secure_url,
      });
    }
  }

  req.body.displayPhoto = MainDisplayPhoto;
  req.body.photos = ImagesArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.GetAllProducts = SuperPromise(async (req, res, next) => {
  let resultPerPage = req.query.resultPerPage;
  let sortField = req.query.sortField ? req.query.sortField : "name";
  let sortCriteria = req.query.sortCriteria ? req.query.sortCriteria : "asc";

  const totalcountProduct = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;
  if (resultPerPage) {
    productsObj.pager(parseInt(resultPerPage));
  }

  if (req.params.category) {
    products = await productsObj.base
      .find({ category: req.params.category })
      .populate("category")
      .sort([[sortField, sortCriteria]])
      .clone();
  } else {
    products = await productsObj.base
      .populate("category")
      .sort([[sortField, sortCriteria]])
      .clone();
  }

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
  });
});

exports.GetProductById = SuperPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      error: {
        message: "Product Not Found",
      },
    });
  }

  const DisplayPhoto = product.displayPhoto;

  product.photos.splice(0, 0, DisplayPhoto);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.GetProductsByCategory = SuperPromise(async (req, res, next) => {
  const products = await Product.find({ category: req.params.id }).populate(
    "category"
  );
  // console.log(products);

  res.status(200).json({
    success: true,
    products,
  });
});

exports.GetReviewsByProductId = SuperPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

exports.Admin_AddProductStockById = SuperPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  const AddBy = req.body.addBy;

  if (!product) {
    return res.status(404).json({
      error: {
        message: "Product Not Found",
      },
    });
  }

  const CurrentStock = product?.stock;

  let NewStock = parseInt(CurrentStock) + parseInt(AddBy);

  product.stock = NewStock;

  product.save();

  res.status(200).json({
    success: true,
    message: `Stock Updated, Added ${req.body.addBy}  `,
  });
});

exports.AddReview = SuperPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const AlreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (AlreadyReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.DeleteReview = SuperPromise(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  const reviews = product.filter(
    (review) => review.user.toString() === req.user._id.toString()
  );

  const numberOfReviews = reviews.length;

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.Admin_GetAllProducts = SuperPromise(async (req, res, next) => {
  let resultPerPage = req.query.resultPerPage;
  let sortField = req.query.sortField ? req.query.sortField : "name";
  let sortCriteria = req.query.sortCriteria ? req.query.sortCriteria : "asc";

  const totalcountProduct = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;
  if (resultPerPage) {
    productsObj.pager(parseInt(resultPerPage));
  }

  if (req.params.category) {
    products = await productsObj.base
      .find({ category: req.params.category })
      .populate("category")
      .sort([[sortField, sortCriteria]])
      .clone();
  } else {
    products = await productsObj.base
      .populate("category")
      .sort([[sortField, sortCriteria]])
      .clone();
  }

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
  });
});

exports.Admin_UpdateProductById = SuperPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  let MainDisplayPhoto;
  let ImagesArray = [];

  if (!product) {
    return res.status(404).json({
      error: {
        message: "Product Not Found",
      },
    });
  }

  if (req.files?.displayPhoto) {
    let products = await cloudinary.v2.uploader.destroy(
      product.displayPhoto.id
    );
    console.log(products);
    let result = await cloudinary.v2.uploader.upload(
      req.files.displayPhoto.tempFilePath,
      {
        folder: "Products-Display-Photo",
        width: "1920",
        height: "2880",
      }
    );
    MainDisplayPhoto = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  if (req.files?.photos) {
    if (req.files.photos.constructor === Array) {
      for (let index = 0; index < product.photos.length; index++) {
        const res = await cloudinary.v2.uploader.destroy(
          product.photos[index].id
        );
      }

      for (let index = 0; index < req.files.photos.length; index++) {
        let result = await cloudinary.v2.uploader.upload(
          req.files.photos[index].tempFilePath,
          {
            folder: "Products-Photos",
            width: "1920",
            height: "2880",
          }
        );
        ImagesArray.push({
          id: (await result).public_id,
          secure_url: (await result).secure_url,
        });
      }
    } else {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos.tempFilePath,
        {
          folder: "Products-Photos",
          width: "1920",
          height: "2880",
        }
      );
      ImagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.displayPhoto = MainDisplayPhoto;
  req.body.photos = ImagesArray;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.Admin_DeleteProductById = SuperPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      error: {
        message: "Product Not Fount",
      },
    });
  }

  const ImagesArray = product?.photos;

  if (ImagesArray) {
    for (let index = 0; index < ImagesArray.length; index++) {
      const res = await cloudinary.v2.uploader.destroy(ImagesArray[index].id);
    }
  }

  await product.remove();
  res.status(200).json({
    success: true,
  });
});
