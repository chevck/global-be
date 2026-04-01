const BudgetUser = require("../models/budgetUserModel");
const Budget = require("../models/budgetModel");
const {
  hashPassword,
  comparePassword,
  signToken,
} = require("../utils/auth");

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

const validateMonth = (month) => monthPattern.test(month);

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const existingUser = await BudgetUser.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const user = await BudgetUser.create({
      email: email.toLowerCase(),
      password: await hashPassword(password),
      name,
    });

    const token = signToken({ userId: user._id, project: "budgets" });

    return res.status(201).json({
      message: "Budget user registered successfully.",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await BudgetUser.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken({ userId: user._id, project: "budgets" });

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createBudget = async (req, res) => {
  try {
    const { month, plannedAmount, actualSpent, notes } = req.body;

    if (!month || plannedAmount === undefined || actualSpent === undefined) {
      return res.status(400).json({
        message: "Month, plannedAmount, and actualSpent are required.",
      });
    }

    if (!validateMonth(month)) {
      return res.status(400).json({ message: "Month must be in YYYY-MM format." });
    }

    const budget = await Budget.create({
      user: req.user._id,
      month,
      plannedAmount,
      actualSpent,
      notes,
    });

    return res.status(201).json({
      message: "Budget created successfully.",
      budget,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A budget already exists for this month.",
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

const fetchBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort({ month: -1 });

    return res.json({
      message: "Budgets fetched successfully.",
      count: budgets.length,
      budgets,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const processBudget = async (req, res) => {
  try {
    const { month } = req.params;

    if (!validateMonth(month)) {
      return res.status(400).json({ message: "Month must be in YYYY-MM format." });
    }

    const currentBudget = await Budget.findOne({ user: req.user._id, month });

    if (!currentBudget) {
      return res.status(404).json({ message: "Budget not found for that month." });
    }

    const previousBudgets = await Budget.find({
      user: req.user._id,
      month: { $lt: month },
    })
      .sort({ month: -1 })
      .limit(3);

    const previousAverage =
      previousBudgets.length > 0
        ? previousBudgets.reduce((sum, budget) => sum + budget.actualSpent, 0) /
          previousBudgets.length
        : 0;

    let status = "no-history";
    let message = "No previous months found to compare against.";

    if (previousBudgets.length > 0) {
      if (currentBudget.actualSpent > previousAverage) {
        status = "overspent";
        message = "You have overspent compared to your previous months.";
      } else if (currentBudget.actualSpent < previousAverage) {
        status = "better";
        message = "You spent less than your previous months. Good progress.";
      } else {
        status = "same";
        message = "Your spending matches your previous average.";
      }
    }

    return res.json({
      message: "Budget processed successfully.",
      result: {
        month: currentBudget.month,
        plannedAmount: currentBudget.plannedAmount,
        actualSpent: currentBudget.actualSpent,
        previousMonthsCompared: previousBudgets.length,
        previousAverageSpent: Number(previousAverage.toFixed(2)),
        differenceFromAverage: Number(
          (currentBudget.actualSpent - previousAverage).toFixed(2),
        ),
        status,
        insight: message,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const chartData = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id })
      .sort({ month: 1 })
      .select("month plannedAmount actualSpent");

    return res.json({
      message: "Chart data fetched successfully.",
      chart: budgets.map((budget) => ({
        month: budget.month,
        plannedAmount: budget.plannedAmount,
        actualSpent: budget.actualSpent,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  createBudget,
  fetchBudgets,
  processBudget,
  chartData,
};
