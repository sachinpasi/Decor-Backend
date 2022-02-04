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
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(express.urlencoded({ extended: true }));

//Routes Imported
const Home = require("./Routes/HomeRoute");
const User = require("./Routes/UserRoutes");
const Product = require("./Routes/ProductRoute");
const Category = require("./Routes/CategoryRoute");
const Payment = require("./Routes/PaymentRoutes");
const Order = require("./Routes/OrderRoute");

//Router Middleware
app.use("/api/v1", Home);
app.use("/api/v1", User);
app.use("/api/v1", Product);
app.use("/api/v1", Category);
app.use("/api/v1", Payment);
app.use("/api/v1", Order);

app.get("/", (req, res) => {
  res.send("Decor Backend");
});

module.exports = app;
