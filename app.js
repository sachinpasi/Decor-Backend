require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();

app.set("view engine", "ejs");

app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);
app.use(express.urlencoded({ extended: true }));

//Routes Imported
const Home = require("./Routes/HomeRoute");
const User = require("./Routes/UserRoutes");

//Router Middleware
app.use("/api/v1", Home);
app.use("/api/v1", User);

app.get("/signuptest", (req, res) => {
  res.render("signup");
});

module.exports = app;
