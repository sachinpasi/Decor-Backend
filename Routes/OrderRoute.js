const express = require("express");
const {
  CreateOrder,
  GetOrderById,
  GetAllOrdersByUserId,

  DeleteOrderById,
  Admin_GetAllOrders,
} = require("../Controllers/orderController");
const Router = express.Router();

const { isLoggedIn, Role } = require("../Middlewares/User");

Router.post("/order/create", isLoggedIn, CreateOrder);
Router.get("/order/getOrderById/:id", isLoggedIn, GetOrderById);
Router.get("/order/getAllOrdersByUserId", isLoggedIn, GetAllOrdersByUserId);
Router.delete("/order/delete/:id", isLoggedIn, DeleteOrderById);

Router.get(
  "/admin/order/getAllOrders",
  isLoggedIn,
  Role("admin"),
  Admin_GetAllOrders
);

module.exports = Router;
