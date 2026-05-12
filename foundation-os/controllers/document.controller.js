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
      const data = {
        id: projectSnapshot.id,
        ...serializeFirestoreValue(projectSnapshot.data()),
      };
      console.log({ data });

      const [
        transactions,
        donorsRaw,
        donationsRaw,
        volunteers,
        budgetItems,
        budgetEntries,
        financeSnapshots,
      ] = await Promise.all([
        fetchSubcollection(projectRef, "transactions"),
        fetchSubcollection(projectRef, "donors"),
        fetchSubcollection(projectRef, "donations"),
        fetchSubcollection(projectRef, "volunteers"),
        fetchSubcollection(projectRef, "budgetItems"),
        fetchSubcollection(projectRef, "budget"),
        fetchSubcollection(projectRef, "finance"),
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
        model: REPORT_MODEL,
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: `You are writing an impact and accountability report for stakeholders.
    
    Organization: ${ngoName}
    Project id: ${projectId}
    
    Use ONLY the JSON data below. If a section has no data, say so briefly rather than inventing figures or names.
    
    Data:
    ${JSON.stringify(projectData, null, 2)}
    
    Produce a professional report with these sections:
    1. Executive summary
    2. Project overview (goals, timeline, location if present in data)
    3. Financial overview (budget line items, totals if computable from the data, transactions summary)
    4. Donors and funding (aggregate counts/amounts where possible; do not fabricate donor identities beyond what is in the data)
    5. Volunteers and participation
    6. Impact and outcomes (only what can be inferred from provided fields)
    7. Risks, gaps, or data limitations
    8. Recommendations for next steps
    
    Use clear headings and bullet points where helpful.`,
          },
        ],
      });

      const reportText = extractMessageText(message);
      return res.status(200).json({
        message: "Report generated",
        report: reportText,
        //   meta: {
        //     model: REPORT_MODEL,
        //     projectId,
        //     counts: {
        //       transactions: transactions.length,
        //       donors: donors.length,
        //       volunteers: volunteers.length,
        //       budgetItems: budgetItems.length,
        //       budgetDocuments: budgetEntries.length,
        //       financeRecords: financeSnapshots.length,
        //     },
        //   },
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

const PROJECTS_COLLECTION =
  process.env.FIRESTORE_PROJECTS_COLLECTION || "projects";
const NGOS_COLLECTION = process.env.FIRESTORE_NGOS_COLLECTION || "ngos";
const REPORT_MODEL =
  process.env.ANTHROPIC_REPORT_MODEL || "claude-sonnet-4-20250514";
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

function docToPlain(docSnap) {
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...serializeFirestoreValue(docSnap.data()) };
}

async function fetchSubcollection(projectRef, name) {
  const snap = await projectRef
    .collection(name)
    .limit(SUBCOLLECTION_LIMIT)
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    ...serializeFirestoreValue(d.data()),
  }));
}

function extractMessageText(message) {
  if (!message?.content?.length) return "";
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

// module.exports = {
//   handleGenerateImpactReport: async (req, res) => {
//     const { projectId, ngoId: ngoIdFromBody } = req.body || {};
//     if (!projectId || typeof projectId !== "string") {
//       return res.status(400).json({
//         message: "projectId is required in the request body",
//       });
//     }

//     try {
//       const db = firebaseUtils.db;
//       const projectRef = db.collection(PROJECTS_COLLECTION).doc(projectId);
//       const projectSnap = await projectRef.get();

//       if (!projectSnap.exists) {
//         return res.status(404).json({ message: "Project not found" });
//       }

//       const project = docToPlain(projectSnap);
//       const ngoId =
//         ngoIdFromBody ||
//         project?.ngoId ||
//         project?.organizationId ||
//         project?.ngo_id;

//       let ngoName = "the organization";
//       if (ngoId) {
//         const ngoSnap = await db.collection(NGOS_COLLECTION).doc(ngoId).get();
//         if (ngoSnap.exists) {
//           const ngo = ngoSnap.data();
//           ngoName =
//             ngo?.name ||
//             ngo?.organizationName ||
//             ngo?.businessName ||
//             ngo?.displayName ||
//             ngoName;
//         }
//       }

//       const [
//         transactions,
//         donorsRaw,
//         donationsRaw,
//         volunteers,
//         budgetItems,
//         budgetEntries,
//         financeSnapshots,
//       ] = await Promise.all([
//         fetchSubcollection(projectRef, "transactions"),
//         fetchSubcollection(projectRef, "donors"),
//         fetchSubcollection(projectRef, "donations"),
//         fetchSubcollection(projectRef, "volunteers"),
//         fetchSubcollection(projectRef, "budgetItems"),
//         fetchSubcollection(projectRef, "budget"),
//         fetchSubcollection(projectRef, "finance"),
//       ]);

//       const donorById = new Map();
//       for (const d of [...donorsRaw, ...donationsRaw]) {
//         donorById.set(d.id, d);
//       }
//       const donors = [...donorById.values()];

//       const projectData = {
//         project,
//         finance: {
//           lineItems: financeSnapshots,
//           budgetItems,
//           budgetDocuments: budgetEntries,
//           summary: project?.budgetSummary || project?.financialSummary || null,
//         },
//         transactions,
//         donors,
//         volunteers,
//       };

//       const message = await client.messages.create({
//         model: REPORT_MODEL,
//         max_tokens: 8192,
//         messages: [
//           {
//             role: "user",
//             content: `You are writing an impact and accountability report for stakeholders.

// Organization: ${ngoName}
// Project id: ${projectId}

// Use ONLY the JSON data below. If a section has no data, say so briefly rather than inventing figures or names.

// Data:
// ${JSON.stringify(projectData, null, 2)}

// Produce a professional report with these sections:
// 1. Executive summary
// 2. Project overview (goals, timeline, location if present in data)
// 3. Financial overview (budget line items, totals if computable from the data, transactions summary)
// 4. Donors and funding (aggregate counts/amounts where possible; do not fabricate donor identities beyond what is in the data)
// 5. Volunteers and participation
// 6. Impact and outcomes (only what can be inferred from provided fields)
// 7. Risks, gaps, or data limitations
// 8. Recommendations for next steps

// Use clear headings and bullet points where helpful.`,
//           },
//         ],
//       });

//       const reportText = extractMessageText(message);

//       return res.status(200).json({
//         message: "Report generated",
//         report: reportText,
//         meta: {
//           model: REPORT_MODEL,
//           projectId,
//           counts: {
//             transactions: transactions.length,
//             donors: donors.length,
//             volunteers: volunteers.length,
//             budgetItems: budgetItems.length,
//             budgetDocuments: budgetEntries.length,
//             financeRecords: financeSnapshots.length,
//           },
//         },
//       });
//     } catch (error) {
//       console.error("error generating report", error);
//       return res.status(500).json({
//         message: "Could not generate report",
//         detail: error?.message || String(error),
//       });
//     }
//   },
// };
