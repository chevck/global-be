const { auth } = require("../utils/firebase");

const checkAuthorization = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided" });

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };
    next();
  } catch (error) {
    console.log("authentication error: ", error);
    return res.status(401).json({ error: "Unauthorized - Invalid Token" });
  }
};

module.exports = checkAuthorization;
