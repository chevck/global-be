const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);

const comparePassword = async (password, hashedPassword) =>
  bcrypt.compare(password, hashedPassword);

const signToken = ({ userId, project }) =>
  jwt.sign({ userId, project }, process.env.JWT_SECRET, { expiresIn: "7d" });

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
};
