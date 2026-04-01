const express = require("express");

const budgetController = require("../controllers/budgetController");
const createAuthMiddleware = require("../middleware/createAuthMiddleware");
const BudgetUser = require("../models/budgetUserModel");

const router = express.Router();
const budgetAuth = createAuthMiddleware(BudgetUser, "budgets");

router.post("/auth/register", budgetController.register);
router.post("/auth/login", budgetController.login);
router.post("/", budgetAuth, budgetController.createBudget);
router.get("/", budgetAuth, budgetController.fetchBudgets);
router.get("/chart", budgetAuth, budgetController.chartData);
router.get("/process/:month", budgetAuth, budgetController.processBudget);

module.exports = router;
