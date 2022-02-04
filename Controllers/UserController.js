const User = require("../Models/UserModel");
const SuperPromise = require("../Middlewares/SuperPromise");
const CustomError = require("../Utils/CustomError");
const CookieToken = require("../Utils/CookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const MailHelper = require("../Utils/EmailHelper");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

exports.SignUp = SuperPromise(async (req, res, next) => {
  const errors = validationResult(req);

  let result;

  // if (!req.files) {
  //   return next(new CustomError("Photo is Required For Signup", 400));
  // }

  const { name, email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.mapped() });
  }

  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return res.status(400).json({
      error: {
        message: "Email Already Exist",
      },
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result?.public_id,
      secure_url: result?.secure_url,
    },
  });

  CookieToken(user, res);
});

exports.Login = SuperPromise(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.mapped() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).json({
      error: {
        message: "Email is Not Registered",
      },
    });
  }

  //Matching Password
  const isPasswordCorrect = await user.isValidatedPassword(password);

  if (!isPasswordCorrect) {
    return res.status(400).json({
      error: {
        message: "Incorrect Password",
      },
    });
  }

  //Sending Token
  CookieToken(user, res);
});

exports.SendForgotPasswordLink = SuperPromise(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new CustomError("Email Is Required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("Email Not Found", 400));
  }

  const ForgotToken = user.getForgotPasswordToken();

  await user.save({
    validateBeforeSave: false,
  });

  const MyURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${ForgotToken}`;

  const Message = `Copy Paste This Link in Your Url and Hit Enter \n\n ${MyURL}`;

  try {
    await MailHelper({
      email: user.email,
      subject: "Decor - Password Reset Link",
      message: Message,
    });

    res.status(200).json({
      success: true,
      message: "Email Sent Successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return next(new CustomError(error.message, 500));
  }
});

exports.ActualPasswordReset = SuperPromise(async (req, res, next) => {
  const token = req.params.token;

  const EncryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    EncryptedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Invalid Token", 400));
  }

  user.password = req.body.password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  await user.save();

  CookieToken(user, res);
});

exports.Logout = SuperPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout Success",
  });
});

exports.CheckTokenExpiry = SuperPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) {
      res.status(200).json({
        isExpired: true,
      });
    } else {
      res.status(200).json({
        isExpired: false,
      });
    }
  });
});

exports.GetUserDetails = SuperPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.ChangePassword = SuperPromise(async (req, res, next) => {
  const UserId = req.user.id;
  const user = await User.findById(UserId).select("+password");

  const isOldPasswordCorrect = await user.isValidatedPassword(
    req.body.currentPassword
  );

  if (!isOldPasswordCorrect) {
    return res.status(400).json({
      error: {
        message: "Incorrect Password",
      },
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  CookieToken(user, res);
});

exports.UpdateUserDetails = SuperPromise(async (req, res, next) => {
  const NewData = {
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);

    const ImageId = user?.photo?.id;

    if (ImageId) {
      const ResponseFromCloudinaryAfterDelete =
        await cloudinary.v2.uploader.destroy(ImageId);
    }

    const ResponseFromCloudinaryAfterUpload =
      await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
        folder: "users",
        width: 200,
        crop: "scale",
      });

    NewData.photo = {
      id: ResponseFromCloudinaryAfterUpload.public_id,
      secure_url: ResponseFromCloudinaryAfterUpload.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, NewData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.Admin_GetAllUser = SuperPromise(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.Admin_GetUserById = SuperPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(400).json({
      error: {
        message: "User Not Found",
      },
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.Admin_UpdateUserById = SuperPromise(async (req, res, next) => {
  const NewData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    phoneNumber: req.body.phoneNumber,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);

    const ImageId = user?.photo?.id;

    if (ImageId) {
      const ResponseFromCloudinaryAfterDelete =
        await cloudinary.v2.uploader.destroy(ImageId);
    }

    const ResponseFromCloudinaryAfterUpload =
      await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
        folder: "users",
        width: 500,
        height: 500,
        crop: "scale",
      });

    NewData.photo = {
      id: ResponseFromCloudinaryAfterUpload.public_id,
      secure_url: ResponseFromCloudinaryAfterUpload.secure_url,
    };
  }

  if (req.body.phoneNumber) {
    const isPhoneNumberAlreadyInDB = await User.find({
      phoneNumber: req.body.phoneNumber,
    });

    console.log(isPhoneNumberAlreadyInDB);

    if (isPhoneNumberAlreadyInDB.length !== 0) {
      return res.status(400).json({
        error: {
          message: "Phone Number Is Already Registered",
        },
      });
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, NewData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.Admin_DeleteUserById = SuperPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("User Not Found", 401));
  }

  if (req.files) {
    const user = await User.findById(req.user.id);

    const ImageId = user?.photo?.id;

    if (ImageId) {
      await cloudinary.v2.uploader.destroy(ImageId);
    }
  }
  await user.remove();
  res.status(200).json({
    success: true,
  });
});
