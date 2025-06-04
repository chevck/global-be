require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const schoolRoutes = require("./perfect-school-app/routes/school.route");
const studentRoutes = require("./perfect-school-app/routes/student.route");
const teacherRoutes = require("./perfect-school-app/routes/teacher.route");
const {
  checkAuthorization,
} = require("./perfect-school-app/middlewares/checkAuthorization");

const app = express();
app.use(cors());

const mongoURI = process.env.MONGOURI;
mongoose.connect(mongoURI);

mongoose.connection.on("connected", async () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  // console.log("Error connecting to MongoDB:", err);
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

app.use("/psa", schoolRoutes);
app.use("/psa", teacherRoutes);
app.use("/psa", checkAuthorization, studentRoutes);

app.post("/test", async (req, res) => {
  // const result = await sendRegisterEmail({
  //   email: "oyeniranexcellenced@gmail.com",
  //   schoolName: "Perfect School App",
  //   password: "password123",
  // });
  // res.status(200).send(result);
  //   const password = "password123";
  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   console.log({ hashedPassword });
  //   const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  //   console.log({ isPasswordValid });
  //   // const resend = new Resend(process.env.RESEND_API_KEY);
  //   // resend.emails.send({
  //   //   from: "onboarding@resend.dev",
  //   //   to: "oyeniranexcellenced@gmail.com",
  //   //   subject: "Hello, welcome to Perfect School App",
  //   //   html: "<p>Congrats on sending your <strong>first email</strong>!</p><p>This is a test email</p>",
  //   // });
  //   // res.send("Email sent");
});

module.exports = app;
