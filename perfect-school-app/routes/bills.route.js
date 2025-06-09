const express = require("express");
const router = express.Router();
const billsController = require("../controllers/bills.controller");

router.post("/bill", billsController.create);
router.get("/bills", billsController.fetchAll);
router.get("/bill/:id", billsController.fetchBill);
router.get("/bills/stats", billsController.stats);
router.put("/bill/:id", billsController.update);
router.delete("/bill/:id", billsController.delete);

module.exports = router;
