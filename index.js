require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mailRoutes = require("./foundation-os/routes/mails.route");
const paymentRoutes = require("./foundation-os/routes/payment.route");
const webhookRoutes = require("./foundation-os/routes/webhook.route");
const authRoutes = require("./foundation-os/routes/auth.route");
const documentRoutes = require("./foundation-os/routes/document.route");
const {
  rechargeNgosSubscriptionFees,
} = require("./foundation-os/jobs/ngosPaidSubscriptionRenewal.job");
const {
  checkIfProjectShouldBePausedAndSendNotification,
} = require("./foundation-os/jobs/projects.job");

const speaklyAuthRoutes = require("./speakly/routes/auth.route");
const speaklyTaskRoutes = require("./speakly/routes/tasks.route");

const tz = process.env.CRON_TIMEZONE || "UTC";

const app = express();
app.use(cors());

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested, Content-Type, Accept, Authorization, x-cron-secret",
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.use(cors({ origin: "*", credentials: true }));

const port = process.env.PORT || 4200;

app.use("/api/emails", mailRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/documents", documentRoutes);

app.use("/speakly-api/auth", speaklyAuthRoutes);
app.use("/speakly-api/task", speaklyTaskRoutes);

app.post("/test", async (req, res) => {});

// recharge the account of users
cron.schedule(
  "0 0 * * *",
  () => {
    console.log(`[cron] NGO renewal sweep scheduled daily at 00:00 (${tz})`);
    rechargeNgosSubscriptionFees().catch((error) =>
      console.error("[cron] NGO paid subscription renewal sweep failed", error),
    );
  },
  { timezone: tz },
);

// pause inactive projects
cron.schedule(
  "0 0 * * *",
  () => {
    console.log(
      `[cron] NGO project lifecycle tracking scheduled daily at 00:00 (${tz})`,
    );
    checkIfProjectShouldBePausedAndSendNotification().catch((error) =>
      console.error("[cron] NGO project lifecycle examination failed", error),
    );
  },
  { timezone: tz },
);

// pause inactive projects
cron.schedule(
  "0 0 * * *",
  () => {
    console.log(
      `[cron] NGO project lifecycle tracking scheduled daily at 00:00 (${tz})`,
    );
    checkIfProjectShouldBePausedAndSendNotification().catch((error) =>
      console.error("[cron] NGO project lifecycle examination failed", error),
    );
  },
  { timezone: tz },
);

app.listen(port, async () => {
  console.log(`Server ready on port ${port}.`);
});

module.exports = app;
