require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const mongoose = require("mongoose");
// const schoolRoutes = require("./perfect-school-app/routes/school.route");
// const {
//   checkAuthorization,
// } = require("./foundation-os/middlewares/checkAuthorization");
const mailRoutes = require("./foundation-os/controllers/mails.controller");

const app = express();
app.use(cors());

// const mongoURI = process.env.MONGOURI;
// mongoose.connect(mongoURI);

// mongoose.connection.on("connected", async () => {
//   console.log("Connected to MongoDB");
// });

// mongoose.connection.on("error", (err) => {
//   // console.log("Error connecting to MongoDB:", err);
// });

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

// app.use("/psa", schoolRoutes);
// app.use("/psa", teacherRoutes);
// app.use("/psa", examinationRoutes);
// app.use("/utils", utilRoutes);
// app.use("/psa", checkAuthorization, studentRoutes);
// app.use("/psa", checkAuthorization, billRoutes);

// NB: if it crashes again, deploy to render

app.use("/os-be/emails", mailRoutes);

app.post("/test", async (req, res) => {});

module.exports = app;
