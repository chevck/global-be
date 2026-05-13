const Anthropic = require("@anthropic-ai/sdk");
const admin = require("firebase-admin");
const firebaseUtils = require("../utils/firebase");

const client = new Anthropic();

module.exports = {
  handleGenerateImpactReport: async (req, res) => {
    const { projectId } = req.body;
    if (!projectId)
      return res.status(400).json({ message: "Project ID is required" });
    try {
      const projectSnapshot = await firebaseUtils.db
        .collection("projects")
        .doc(projectId)
        .get();
      if (!projectSnapshot.exists)
        return res
          .status(404)
          .json({ message: "Project not found. Contact Admin for support" });
      const project = {
        id: projectSnapshot.id,
        ...serializeFirestoreValue(projectSnapshot.data()),
      };
      const ngo = await firebaseUtils.db
        .collection("ngos")
        .where("userId", "==", project.userId)
        .get();

      const [
        transactions,
        donorsRaw,
        donationsRaw,
        volunteers,
        budgetItems,
        budgetEntries,
        financeSnapshots,
      ] = await Promise.all([
        fetchSubcollection("transactions"),
        fetchSubcollection("donors"),
        fetchSubcollection("donations"),
        fetchSubcollection("volunteers"),
        fetchSubcollection("budgetItems"),
        fetchSubcollection("budget"),
        fetchSubcollection("finance"),
      ]);

      const donorById = new Map();
      for (const d of [...donorsRaw, ...donationsRaw]) {
        donorById.set(d.id, d);
      }
      const donors = [...donorById.values()];
      const projectData = {
        project,
        finance: {
          lineItems: financeSnapshots,
          budgetItems,
          budgetDocuments: budgetEntries,
          summary: project?.budgetSummary || project?.financialSummary || null,
        },
        transactions,
        donors,
        volunteers,
      };
      const message = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: `Generate a professional impact report for ${ngo.ngoName}'s project. Return ONLY valid HTML (no markdown, no code fences). Use semantic HTML5 tags and inline CSS styling.
  IMPORTANT: Include this in the <head>:
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">

Use these fonts:
- Body text: font-family: 'Plus Jakarta Sans', sans-serif;
- paragraphs: font-family: 'Plus Jakarta Sans', sans-serif;
- b tags: font-family: 'Plus Jakarta Sans', sans-serif;
- Headings: font-family: 'Plus Jakarta Sans', serif;
  Project Data:
  ${JSON.stringify(projectData, null, 2)}
  
  Structure it with:
  - Header with NGO name and date
  - Executive Summary
  - Key Metrics (use a table)
  - List the budgets (use a table)
  - List the transaction keys - incomes (1), expenses list (grouped) - (use a table)
  - Impact Areas
  - Challenges & Solutions
  - Recommendations
  
  Make it print-friendly and professional.`,
          },
        ],
      });

      const reportText = extractMessageText(message);
      return res.status(200).json({
        message: "Report generated",
        report: reportText,
      });
    } catch (error) {
      console.error("error generating report", error);
      return res.status(500).json({
        message: "Could not generate report",
        detail: error?.message || String(error),
      });
    }
  },
};

const SUBCOLLECTION_LIMIT = Number(
  process.env.FIRESTORE_REPORT_SUBCOLLECTION_LIMIT || 300,
);

function serializeFirestoreValue(value) {
  if (value === null || value === undefined) return value;
  if (value instanceof admin.firestore.Timestamp) {
    return value.toDate().toISOString();
  }
  if (value instanceof admin.firestore.GeoPoint) {
    return { latitude: value.latitude, longitude: value.longitude };
  }
  if (value instanceof admin.firestore.DocumentReference) {
    return value.path;
  }
  if (Array.isArray(value)) {
    return value.map(serializeFirestoreValue);
  }
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = serializeFirestoreValue(v);
    }
    return out;
  }
  return value;
}

async function fetchSubcollection(name) {
  const snap = await firebaseUtils.db
    .collection(name)
    .limit(SUBCOLLECTION_LIMIT)
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    ...serializeFirestoreValue(d.data()),
  }));
}

function extractMessageText(message) {
  return message.content[0].text;
}
