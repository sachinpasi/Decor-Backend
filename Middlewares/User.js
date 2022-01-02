const User = require("../Models/UserModel");
const SuperPromise = require("../Middlewares/SuperPromise");
const CustomError = require("../Utils/CustomError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = SuperPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  //   console.log(token);

  if (!token) {
    return res.status(400).json({
      error: {
        message: "Unauthorized",
      },
    });
  }

  const Decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(Decoded.id);

  next();
});

exports.Role = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new CustomError("Access Denied", 403));
    }
    next();
  };
};