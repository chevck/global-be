const { Timestamp } = require("firebase-admin/firestore");
const { db } = require("../utils/firebase");
const moment = require("moment");
const {
  sendProjectInactivityNotification,
} = require("../controllers/mails.controller");
const { FOUNDATION_OS_SUPPORT_EMAIL } = require("../utils");
const tz = process.env.CRON_TIMEZONE || "UTC";

module.exports = {
  checkIfProjectShouldBePausedAndSendNotification: async () => {
    console.log("running the cron job to pause project");
    const dayToCompare = moment
      .tz(tz)
      .startOf("day")
      .subtract(1, "days")
      .toDate();

    // get active projects that has not had activity since 15 days ago
    const snapshot = await db
      .collection("projects")
      .where("status", "==", "In Progress")
      .where("lastActivityDate", "<", Timestamp.fromDate(dayToCompare))
      .get();

    for (const document of snapshot.docs) {
      const projectDocument = document.data();
      const ngoDataRef = await db
        .collection("ngos")
        .doc(projectDocument.ngoId)
        .get();
      const ngoData = ngoDataRef.data();
      const emailBodyData = {
        firstName: ngoData.firstName,
        emails: [ngoData.email, ngoData.ngoEmail],
        foundationName: ngoData.ngoName,
        projectName: projectDocument.title,
        projectStatus: projectDocument.status,
        lastActivityDate: projectDocument.lastActivityDate,
        daysInactive: `${moment(projectDocument.lastActivityDate).diff(
          new Date(),
          "days",
        )} days`,
        pauseDeadline: `${moment().format("YYYY-MM-DD")}`,
        projectUrl: `${process.env.FOUNDATION_OS_BASE_URL}/projects/${document.id}`,
        supportEmail: FOUNDATION_OS_SUPPORT_EMAIL,
      };
      return sendProjectInactivityNotification(emailBodyData);
    }

    console.log("send out notifications successfully to ");
  },
};
