require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const emailRoutes = require("./irisi/routes/email.routes");

const app = express();
app.use(cors());

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested, Content-Type, Accept Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.use(cors({ origin: "*", credentials: true }));

app.listen(process.env.PORT || 5300, () =>
  console.log("Server ready on port 5300.")
);

app.use("/emails", emailRoutes);

module.exports = app;
