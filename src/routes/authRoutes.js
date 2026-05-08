const express = require("express");

const { validateAuthToken } = require("../utils/auth");

const router = express.Router();

router.post("/validate-token", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const token = req.body?.authToken ?? bearer;

  const result = validateAuthToken(token);

  const statusCode = result.tokenProvided ? 200 : 400;
  return res.status(statusCode).json({
    expired: result.expired,
    valid: result.valid,
    ...(result.message && { message: result.message }),
    ...(result.expiresAt && { expiresAt: result.expiresAt }),
  });
});

module.exports = router;
