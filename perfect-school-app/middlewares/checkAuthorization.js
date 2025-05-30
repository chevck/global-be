const jwt = require("jsonwebtoken");

const checkAuthorization = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.exp < Date.now() / 1000) {
    return res.status(401).json({ message: "Token expired" });
  }
  req.user = decoded;
  next();
};

module.exports = {
  checkAuthorization,
};
