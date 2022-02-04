const express = require("express");
const { check } = require("express-validator");

const { isLoggedIn, Role } = require("../Middlewares/User");
const {
  CreateProduct,
  GetAllProducts,
  Admin_GetAllProducts,
  GetProductById,
  Admin_UpdateProductById,
  Admin_DeleteProductById,
  AddReview,
  DeleteReview,
  GetReviewsByProductId,
  GetProductsByCategory,
  Admin_AddProductStockById,
} = require("../Controllers/ProductController");

const Router = express.Router();

Router.get("/product/getAllProducts", GetAllProducts);
Router.get("/product/getProductById/:id", GetProductById);
Router.get("/product/getProductsByCategory/:id", GetProductsByCategory);

Router.put("/review/add", isLoggedIn, AddReview);
Router.delete("/review/delete/:id", isLoggedIn, DeleteReview);
Router.get("/review/getReviewProductId", GetReviewsByProductId);

Router.post("/admin/product/create", isLoggedIn, Role("admin"), CreateProduct);
Router.get(
  "/admin/product/getAllProducts",
  isLoggedIn,
  Role("admin"),
  Admin_GetAllProducts
);
Router.put(
  "/admin/product/addstock/:id",
  isLoggedIn,
  Role("admin"),
  Admin_AddProductStockById
);
Router.put(
  "/admin/product/update/:id",
  isLoggedIn,
  Role("admin"),
  Admin_UpdateProductById
);
Router.delete(
  "/admin/product/delete/:id",
  isLoggedIn,
  Role("admin"),
  Admin_DeleteProductById
);

module.exports = Router;
