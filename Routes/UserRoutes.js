const express = require("express");
const { check } = require("express-validator");

const Router = express.Router();

const {
  SignUp,
  Login,
  Logout,
  SendForgotPasswordLink,
  ActualPasswordReset,
  GetUserDetails,
  ChangePassword,
  UpdateUserDetails,
  Admin_GetAllUser,
  Admin_GetUserById,
  Admin_UpdateUserById,
  Admin_DeleteUserById,
} = require("../Controllers/UserController");
const { isLoggedIn, Role } = require("../Middlewares/User");

// Router.route("/signup", [check("name").isLength({ min: 3 })]).post(SignUp);
Router.post(
  "/signup",
  [
    check("name")
      .exists()
      .withMessage("Name Is Required")
      .isLength({ min: 3 })
      .withMessage("Name Should Be At Least 3 Char"),
    check("email")
      .exists()
      .withMessage("Email Is Required")
      .isEmail()
      .withMessage("Invalid Email"),
    check("password")
      .exists()
      .withMessage("Password Is Required")
      .isLength({ min: 6 })
      .withMessage("Password Should Be At Least 6 Char"),
  ],
  SignUp
);
Router.post(
  "/login",
  [
    check("email")
      .exists()
      .withMessage("Email Is Required")
      .isEmail()
      .withMessage("Invalid Email"),
    check("password")
      .exists()
      .withMessage("Password Is Required")
      .isLength({ min: 6 })
      .withMessage("Password Should Be At Least 6 Char"),
  ],
  Login
);
Router.route("/logout").get(Logout);
Router.route("/forgotPassword").post(SendForgotPasswordLink);
Router.route("/password/reset/:token").post(ActualPasswordReset);
Router.route("/password/update").post(isLoggedIn, ChangePassword);
Router.route("/userDetails/update").post(isLoggedIn, UpdateUserDetails);
Router.route("/getUserDetails").get(isLoggedIn, GetUserDetails);

Router.route("/admin/users").get(isLoggedIn, Role("admin"), Admin_GetAllUser);

Router.route("/admin/getUserById/:id").get(
  isLoggedIn,
  Role("admin"),
  Admin_GetUserById
);

Router.route("/admin/updateUserById/:id").put(
  isLoggedIn,
  Role("admin"),
  Admin_UpdateUserById
);

Router.route("/admin/updateUserById/:id").delete(
  isLoggedIn,
  Role("admin"),
  Admin_DeleteUserById
);

module.exports = Router;
