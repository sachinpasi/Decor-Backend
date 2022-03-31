const Order = require("../Models/OrderModels");
const Product = require("../Models/ProductModel");
const SuperPromise = require("../Middlewares/SuperPromise");
const { parse } = require("dotenv");
const WhereClause = require("../Utils/WhereClause");
const shortid = require("shortid");

exports.CreateOrder = SuperPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  console.log(req.body);

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
    orderId: shortid(),
  });

  orderItems?.forEach((item) => {
    updateProductStock(item.productId, item.quantity);
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.GetOrderById = SuperPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email "
  );
  if (!order) {
    return res.status(404).json({
      error: {
        message: "Order Not Found",
      },
    });
  }
  res.status(200).json({
    success: true,
    order,
  });
});

exports.GetAllOrdersByUserId = SuperPromise(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  if (!orders) {
    return res.status(404).json({
      error: {
        message: "Order Not Found",
      },
    });
  }
  res.status(200).json({
    success: true,
    orders,
  });
});

exports.DeleteOrderById = SuperPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      error: {
        message: "Order Not Found",
      },
    });
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

exports.Admin_GetAllOrders = SuperPromise(async (req, res, next) => {
  let resultPerPage = req.query.resultPerPage;
  let sortField = req.query.sortField ? req.query.sortField : "name";
  let sortCriteria = req.query.sortCriteria ? req.query.sortCriteria : "asc";

  const totalcountOrder = await Order.countDocuments();

  const ordersObj = new WhereClause(Order.find(), req.query).search().filter();

  let orders = await ordersObj.base;
  const filteredOrderNumber = orders.length;
  if (resultPerPage) {
    ordersObj.pager(parseInt(resultPerPage));
  }

  // if (req.params.category) {
  //   orders = await ordersObj.base
  //     .find({ category: req.params.category })
  //     .populate("category")
  //     .sort([[sortField, sortCriteria]])
  //     .clone();
  // } else {
  //   orders = await ordersObj.base
  //     .populate("category")
  //     .sort([[sortField, sortCriteria]])
  //     .clone();
  // }

  orders = await ordersObj.base.sort([[sortField, sortCriteria]]).clone();

  res.status(200).json({
    success: true,
    orders,
    filteredOrderNumber,
    totalcountOrder,
  });
});

exports.AdminUpdateOrderById = SuperPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      error: {
        message: "Order Not Found",
      },
    });
  }

  if (order.orderStatus === "delivered") {
    return res.status(404).json({
      error: {
        message: "Order is Already Delivered",
      },
    });
  }

  order.orderStatus = req.body.status;

  order.orderItems.forEach(async (item) => {
    updateProductStock(item.productId, item.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.DeleteOrderById = SuperPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      error: {
        message: "Order Not Found",
      },
    });
  }

  await order.remove();

  res.status(200).json({
    success: true,
    orders,
  });
});

async function updateProductStock(ProductId, Quantity) {
  const product = await Product.findById(ProductId);

  product.stock = parseInt(product.stock) - parseInt(Quantity);
  product.sold = parseInt(product.sold) + parseInt(Quantity);

  await product.save({ validateBeforeSave: true });
}
