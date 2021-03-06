const SuperPromise = require("../Middlewares/SuperPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Razorpay = require("razorpay");
const shortid = require("shortid");

exports.SendStripeKey = SuperPromise(async (req, res, next) => {
  res.status(200).json({
    stripekey: process.env.STRIPE_API_KEY,
  });
});

exports.CaptureStripePayment = SuperPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",

    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    paymentIntent,
  });
});

exports.SendRazorpayKey = SuperPromise(async (req, res, next) => {
  res.status(200).json({
    key: process.env.RAZORPAY_API_KEY,
  });
});

exports.CaptureRazorpayPayment = SuperPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const myOrder = await instance.orders.create({
    amount: (req.body.amount * 100).toString(),
    currency: "INR",
    receipt: shortid.generate(),
    payment_capture: 1,
  });

  console.log(myOrder);
  res.status(200).json({
    success: true,
    myOrder,
  });
});
