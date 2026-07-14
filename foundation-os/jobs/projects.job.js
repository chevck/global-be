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

// Inactivity window is configurable so the same job can run on a fast test
// cadence (every 15 minutes, 15-minute window) or the real cadence
// (daily, 15-day window). Flip these env vars — no code change needed:
//   PROJECT_INACTIVITY_UNIT   -> "minutes" (test) | "days" (production, default)
//   PROJECT_INACTIVITY_AMOUNT -> number of units of inactivity (default 15)
// const INACTIVITY_UNIT =
//   process.env.PROJECT_INACTIVITY_UNIT === "minutes" ? "minutes" : "days";
const INACTIVITY_UNIT = "days";
const INACTIVITY_AMOUNT = Number(process.env.PROJECT_INACTIVITY_AMOUNT) || 15;

function inactivityCutoff() {
  const now = moment.tz(tz);
  // In days mode we compare against the start of the day (existing behaviour);
  // in minutes mode we need the exact instant so 15-minute windows work.
  const base = INACTIVITY_UNIT === "days" ? now.clone().startOf("day") : now;
  return base.subtract(INACTIVITY_AMOUNT, INACTIVITY_UNIT).toDate();
}

module.exports = {
  checkIfProjectShouldBePausedAndSendNotification: async () => {
    console.log(
      `running the cron job to pause projects inactive for ${INACTIVITY_AMOUNT} ${INACTIVITY_UNIT}`,
    );
    const cutoff = inactivityCutoff();

    console.log({ cutoff });

    // get active projects that have had no activity since the cutoff
    const snapshot = await db
      .collection("projects")
      .where("status", "==", "In Progress")
      .where("lastActivityDate", "<", Timestamp.fromDate(cutoff))
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
      const inactiveFor = moment
        .tz(tz)
        .diff(lastActivityMoment, INACTIVITY_UNIT);
      const emailBodyData = {
        firstName: ngoData.firstName,
        emails: [ngoData.email, ngoData.ngoEmail],
        foundationName: ngoData.ngoName,
        projectName: projectDocument.title,
        projectStatus: "Paused",
        lastActivityDate: lastActivityMoment.format("D MMMM YYYY"),
        daysInactive: `${inactiveFor} ${INACTIVITY_UNIT}`,
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
