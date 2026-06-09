const { Timestamp } = require("firebase-admin/firestore");
const { db } = require("../utils/firebase");
const moment = require("moment-timezone");
const {
  sendProjectInactivityNotification,
} = require("../controllers/mails.controller");
const { FOUNDATION_OS_SUPPORT_EMAIL } = require("../utils");
const tz = process.env.CRON_TIMEZONE || "UTC";

function toJsDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

module.exports = {
  checkIfProjectShouldBePausedAndSendNotification: async () => {
    console.log("running the cron job to pause project");
    const dayToCompare = moment
      .tz(tz)
      .startOf("day")
      .subtract(15, "days")
      .toDate();

    // get active projects that has not had activity since 15 days ago
    const snapshot = await db
      .collection("projects")
      .where("status", "==", "In Progress")
      .where("lastActivityDate", "<", Timestamp.fromDate(dayToCompare))
      .get();

    const batch = db.batch();
    for (const document of snapshot.docs) {
      const projectDocument = document.data();
      const ngoDataRef = await db
        .collection("ngos")
        .doc(projectDocument.ngoId)
        .get();
      const ngoData = ngoDataRef.data();
      const lastActivity = toJsDate(projectDocument.lastActivityDate);
      const lastActivityMoment = moment.tz(lastActivity, tz);
      const emailBodyData = {
        firstName: ngoData.firstName,
        emails: [ngoData.email, ngoData.ngoEmail],
        foundationName: ngoData.ngoName,
        projectName: projectDocument.title,
        projectStatus: "Paused",
        lastActivityDate: lastActivityMoment.format("D MMMM YYYY"),
        daysInactive: `${moment.tz(tz).startOf("day").diff(lastActivityMoment.startOf("day"), "days")} days`,
        projectUrl: `${process.env.FOUNDATION_OS_BASE_URL}/projects/${document.id}`,
        supportEmail: FOUNDATION_OS_SUPPORT_EMAIL,
      };
      const projectRef = db.collection("projects").doc(document.id);
      batch.update(projectRef, { status: "Paused", pausedAt: Timestamp.now() });
      sendProjectInactivityNotification(emailBodyData);
    }
    await batch.commit();
    console.log(
      `send out notifications successfully to pause ${snapshot.docs.length} projects`,
    );
  },

  checkIfUserHasCreatedProjectNotification: async () => {
    console.log("running the cron job to check if ngo has created project");
    const dayToCompare = moment
      .tz(tz)
      .startOf("day")
      .subtract(10, "days")
      .toDate();

    const snapshot = await db
      .collection("ngos")
      .where("createdAt", "<", Timestamp.fromDate(dayToCompare))
      // .where("sentCreateProjectPrompt", "==", false)
      .get();

    const hasNotCreatedProject = [];

    for (const ngo of snapshot.docs) {
      const ngoData = ngo.data();
      if (!!ngoData.sentCreateProjectPrompt) return;
      const projects = await db
        .collection("projects")
        .where("ngoId", "==", ngo.id)
        .get();
      if (!projects.docs.length) return hasNotCreatedProject.push(ngo.id);
    }
    if (!hasNotCreatedProject.length)
      return console.log("There are no ngos that have not been sent email");
  },
};
