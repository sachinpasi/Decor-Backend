const mongoose = require("mongoose");

const ConnectToDatabase = () => {
  mongoose
    .connect(process.env.DATABASE_URL_DEVELOPMENT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB CONNECTED"))
    .catch((error) => {
      console.log("DB CONNECTION ERROR");
      console.log(error);
      process.exit(1);
    });
};

module.exports = ConnectToDatabase;
