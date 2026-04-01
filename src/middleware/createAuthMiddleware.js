const jwt = require("jsonwebtoken");

const createAuthMiddleware = (UserModel, project) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "Authorization token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.project !== project) {
      return res.status(401).json({ message: "Invalid token scope." });
    }

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = createAuthMiddleware;
