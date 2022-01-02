const express = require("express");
const Router = express.Router();

const { Home, HomeDummy } = require("../Controllers/HomeController");

Router.route("/").get(Home);
Router.route("/dummy").get(HomeDummy);

module.exports = Router;
