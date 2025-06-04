const express = require("express");
const teacherController = require("../controllers/teacher.controller");
const {
  checkAuthorization,
  checkUnAuthenticatedTeacherAuthorization,
} = require("../middlewares/checkAuthorization");
const router = express.Router();

router.post("/teacher-create", checkAuthorization, teacherController.create);
router.get("/teachers", checkAuthorization, teacherController.getAll);
router.put("/teacher/:id", checkAuthorization, teacherController.update);
router.delete(
  "/teacher-delete/:id",
  checkAuthorization,
  teacherController.delete
);
router.get(
  "/teacher-by-code/:teacherCode",
  checkUnAuthenticatedTeacherAuthorization, // used for calls outside the app
  teacherController.getByTeacherCode
);
router.post(
  "/complete-teacher-registration",
  checkUnAuthenticatedTeacherAuthorization, // used for calls outside the app
  teacherController.completeTeacherRegistration
);
router.post("/teacher-login", teacherController.login);
router.post("/teacher-confirm-otp", teacherController.confirmOTP);
module.exports = router;
