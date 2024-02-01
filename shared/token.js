const token = (req, res, next) => {
  const bearerToken = req.headers["authorization"];
  if (!bearerToken) {
    res
      .status(422)
      .send({ statusCode: 422, message: "Please provide bearer token" });
  } else {
    next();
  }
};
module.exports = token;
