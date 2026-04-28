require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const {
//   checkAuthorization,
// } = require("./foundation-os/middlewares/checkAuthorization");
const mailRoutes = require("./foundation-os/routes/mails.route");
const paymentRoutes = require("./foundation-os/routes/payment.route");

const app = express();
app.use(cors());

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested, Content-Type, Accept Authorization",
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.use(cors({ origin: "*", credentials: true }));

app.listen(process.env.PORT || 4200, () =>
  console.log("Server ready on port 4200."),
);

// NB: if it crashes again, deploy to render
app.use("/api/emails", mailRoutes);
app.use("/api/payment", paymentRoutes);

app.post("/test", async (req, res) => {});

module.exports = app;
