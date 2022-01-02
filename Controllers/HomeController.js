const SuperPromise = require("../Middlewares/SuperPromise");

exports.Home = SuperPromise(async (req, res) => {
  // const db = await somting()
  res.status(200).json({
    success: true,
    greeting: "Hello",
  });
});

exports.HomeDummy = (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "This Is Another Dummy Route",
  });
};
