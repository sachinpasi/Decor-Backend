const express = require("express");
const { check } = require("express-validator");
const {
  CreateCategory,
  GetCategoryById,
  DeleteCategoryById,
  GetAllCategory,
} = require("../Controllers/CategoryController");

const { isLoggedIn, Role } = require("../Middlewares/User");

const Router = express.Router();

Router.get("/category/all", GetAllCategory);

Router.get("/category/:id", GetCategoryById);
Router.post("/category/create", isLoggedIn, Role("admin"), CreateCategory);
Router.delete(
  "/category/delete/:id",
  isLoggedIn,
  Role("admin"),
  DeleteCategoryById
);

module.exports = Router;
