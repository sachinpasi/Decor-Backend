const express = require("express");
const {
  SendStripeKey,
  SendRazorpayKey,
  CaptureRazorpayPayment,
  CaptureStripePayment,
} = require("../Controllers/PaymentController");
const Router = express.Router();

const { isLoggedIn, Role } = require("../Middlewares/User");

Router.get("/stripekey", isLoggedIn, SendStripeKey);
Router.get("/razorpaykey", isLoggedIn, SendRazorpayKey);

Router.post("/razorpay/payment", isLoggedIn, CaptureRazorpayPayment);
Router.post("/stripe/payment", isLoggedIn, CaptureStripePayment);

module.exports = Router;
