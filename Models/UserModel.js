const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 40,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  phoneNumber: {
    type: String,
    minlength: 10,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      // required: true,
    },
    secure_url: {
      type: String,
      // required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Encrypting Password Before Saving Into Database :-
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//Validating The Password With Passed On User Password :-
userSchema.methods.isValidatedPassword = async function (
  PasswordReceivedFromUser
) {
  return await bcryptjs.compare(PasswordReceivedFromUser, this.password);
};

//Methods For Creating And Jwt Token :-
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

//To Generate Forgot Password Token(string) :-
userSchema.methods.getForgotPasswordToken = function () {
  const ForgotToken = crypto.randomBytes(20).toString("hex");

  //Getting A Hash - Make Sure To Get A Hash On Backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(ForgotToken)
    .digest("hex");

  //Time Of Token
  this.forgotPasswordTokenExpiry = Date.now() + 20 * 60 * 100;

  return ForgotToken;
};

module.exports = mongoose.model("User", userSchema);
