const express = require("express");
const roleController = require("../controllers/roles.controller");
const router = express.Router();

router.post("/role", roleController.create);

module.exports = router;
