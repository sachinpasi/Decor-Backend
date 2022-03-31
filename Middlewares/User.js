const User = require("../Models/UserModel");
const SuperPromise = require("../Middlewares/SuperPromise");
const CustomError = require("../Utils/CustomError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = SuperPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  console.log(req.header);

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
      return res.status(403).json({
        error: {
          message: "Access Denied",
        },
      });
    }
    next();
  };
};
