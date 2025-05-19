require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());

const mongoURI = `mongodb+srv://haryoexcellence:O31L96Q0ysZTVed0@cluster0.fogbqsh.mongodb.net/`;
mongoose.connect(mongoURI);

mongoose.connection.on("connected", async () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log("Error connecting to MongoDB:", err);
});

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

app.post("/test", (req, res) => res.send("Testing this works"));

module.exports = app;
