const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);

const comparePassword = async (password, hashedPassword) =>
  bcrypt.compare(password, hashedPassword);

const signToken = ({ userId, project }) =>
  jwt.sign({ userId, project }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Verifies JWT with JWT_SECRET (signature), then compares `exp` to now.
const validateAuthToken = (token) => {
  if (token == null || (typeof token === "string" && !token.trim())) {
    return {
      tokenProvided: false,
      valid: false,
      expired: null,
      message: "authToken is required (body) or Authorization Bearer header.",
    };
  }

  const trimmed = String(token).trim();

  if (!process.env.JWT_SECRET) {
    return {
      tokenProvided: true,
      valid: false,
      expired: null,
      message: "Server is not configured for JWT verification.",
    };
  }

  try {
    const decoded = jwt.verify(trimmed, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });
    const nowSec = Math.floor(Date.now() / 1000);
    const hasExp = decoded.exp != null && typeof decoded.exp === "number";
    const expired = hasExp && decoded.exp < nowSec;
    return {
      tokenProvided: true,
      valid: true,
      expired,
      ...(hasExp && {
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      }),
    };
  } catch {
    return {
      tokenProvided: true,
      valid: false,
      expired: null,
      message: "Invalid or malformed token.",
    };
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  validateAuthToken,
};
