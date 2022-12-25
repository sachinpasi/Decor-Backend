require("dotenv").config();
const app = require("./app");
const ConnectToDatabase = require("./Configs/ConnectToDatabase");
const cloudinary = require("cloudinary");

const PORT = process.env.PORT || 4000;

ConnectToDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, () => {
  console.log(`Server is running at port : ${PORT}`);
});
//
