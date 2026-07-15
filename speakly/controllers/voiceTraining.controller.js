const Anthropic = require("@anthropic-ai/sdk");
const { Timestamp } = require("firebase-admin/firestore");
const { db } = require("../../foundation-os/utils/firebase");

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert speech trainer and communication coach who specialises in designing personalised 21-day speech training programmes. You have deep expertise in:
- Speech impediments, pace regulation, and articulation therapy
- Cognitive-linguistic training for clear thought delivery
- Public speaking and impromptu communication
- Behavioural habit formation over 21-day cycles

Your task is to generate a complete, structured 21-day speech training programme tailored to the user's specific speech challenges, goals, and focus areas.

PROGRAMME ARCHITECTURE:
- Always divide the 21 days into 3 phases of 7 days each
- Phase 1: Address the root cause / build foundational awareness
- Phase 2: Build structure and shape of communication
- Phase 3: Real world delivery and performance

FOR EACH DAY, provide a JSON object with exactly these fields:
- day: number (1-21)
- phase: number (1, 2, or 3)
- title: string (short, evocative name for the exercise)
- duration: string (e.g. "10 min", "15 min")
- type: string (one of: Awareness | Articulation | Pacing | Rhythm | Muscle | Reflection | Clarity | Structure | Emotion | Flow | Feedback | Review | Delivery | Impact | Physical | Spontaneity | Expression | Performance)
- description: string (what to do and why, 2-3 sentences)
- exercise: string (the exact drill or activity, step by step)
- why: string (the science or mechanism behind this exercise)
- tip: string (one coach's insider tip for this day)

PHASE METADATA:
For each phase, also provide:
- phaseTitle: string
- phaseSubtitle: string (e.g. "Days 1-7")
- phaseBrief: string (the theme/focus of this phase in one sentence)
- phaseGoal: string (what the learner will achieve by end of phase)

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown, no explanation, no preamble.
The JSON structure must be exactly:
{
  "programmeTitle": string,
  "programmeSummary": string,
  "targetProfile": string,
  "phases": [
    {
      "id": 1,
      "title": string,
      "subtitle": string,
      "brief": string,
      "goal": string,
      "days": [ ...7 day objects ]
    },
    ...
  ]
}`;

function buildUserMessage(profile) {
  const list = (items) =>
    (items ?? []).map((item) => `- ${item}`).join("\n") || "- (none provided)";

  return `Generate a personalised ${profile.programmeDuration}-day speech training programme for this learner:

    SPEECH CHALLENGES:
    ${list(profile.reasonsForJoining)}

    GOALS:
    ${list(profile.endGoals)}

    FOCUS AREAS:
    ${list(profile.focusAreas)}

    ADDITIONAL CONTEXT:
    - Intensity level: moderate
    - Primary speaking context: ${profile.speakingContexts ?? "general"}

    Design all exercises to directly address these specific challenges and move the learner toward these goals. Make each day's exercise practical, actionable, and completable in the stated duration. Escalate complexity across the ${profile.programmeDuration} days — early days build awareness, middle days build skill, final days build real world confidence.`;
}

module.exports = {
  createVoiceTrainingTasks: async (req, res) => {
    try {
      const { uid, programDuration: programmeDuration, role } = req.body;
      if (!uid || !programmeDuration) {
        return res.status(400).json({
          message: "uid and programmeDuration are required",
        });
      }

      console.log(
        "⏳ Generating your personalised speech training programme...\n",
      );

      const response = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserMessage(req.body),
          },
        ],
      });

      const rawText = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");

      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const programme = JSON.parse(cleaned);

      const docRef = db.collection("speakly_programmes").doc();
      await docRef.set({
        track: "voice-training",
        programmeTitle: programme.programmeTitle,
        programmeSummary: programme.programmeSummary,
        targetProfile: programme.targetProfile,
        phases: programme.phases,
        userId: uid,
        programmeDuration,
        role: role ?? null,
        createdAt: Timestamp.now(),
      });

      return res.status(200).json({
        message: "Successfully created programme",
        id: docRef.id,
        programme,
      });
    } catch (error) {
      console.log("error creating voice training programme", error);
      return res.status(500).json({
        message: "There was an error creating the speech training programme",
      });
    }
  },
};
