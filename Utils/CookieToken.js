const CookieToken = (user, res) => {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  user.password = undefined;
  const { _id, name, email, role, photo } = user;
  res.status(200).cookie("token", token, options).json({
    success: true,
    user: {
      _id,
      name,
      email,
      role,
      photo,
      token,
    },
  });
};

module.exports = CookieToken;
