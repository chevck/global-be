const jwt = require("jsonwebtoken");
const teacherModel = require("../models/teacher.model");
const { nonAuthActionReasons } = require("../utils");

const checkAuthorization = (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(401).json({ message: "Unauthorized" });
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.exp < Date.now() / 1000)
      return res.status(401).json({ message: "Token expired" });
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const checkUnAuthenticatedTeacherAuthorization = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.exp < Date.now() / 1000)
      return res.status(401).json({ message: "Token expired" });
    if (decoded.teacherId) {
      const teacher = await teacherModel.findById(decoded.teacherId);
      if (!teacher)
        return res.status(401).json({
          message:
            "This is not a valid teacher account. Reach out to the support team for help",
        });
      req.teacher = teacher;
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log("error", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const checkStudentLoginAuthorization = async () => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log({ decoded });
    if (decoded.exp < Date.now() / 1000)
      return res.status(401).json({ message: "Token expired" });
    if (decoded.action !== nonAuthActionReasons.STUDENT_EXAM_LOGIN)
      return res.status(401).json({ message: "This is an invalid action!" });
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = {
  checkAuthorization,
  checkUnAuthenticatedTeacherAuthorization,
  checkStudentLoginAuthorization,
};
