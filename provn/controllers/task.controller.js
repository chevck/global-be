const Anthropic = require("@anthropic-ai/sdk");
const { Timestamp } = require("firebase-admin/firestore");
const { db } = require("../../foundation-os/utils/firebase");

const client = new Anthropic();

function buildUserMessage(profile) {
  const list = (items) =>
    (items ?? []).map((item) => `- ${item}`).join("\n") || "- (none provided)";

  return `Generate a personalised ${profile.programmeDuration}-day ${list(profile.disciplines)} ${profile.track} training programme for this learner:

CHALLENGES:
${list(profile.reasonsForJoining)}

GOALS:
${list(profile.endGoals)}

FOCUS AREAS:
${list(profile.focusAreas)}

they will like to use their design skills in these settings ${profile.contexts} ${profile.contextsOther ? `and ${profile.contextsOther}` : ""}.

Design all exercises to directly address these specific challenges and move the learner toward these goals. Make each day's exercise practical, actionable, and completable in the stated duration. Escalate complexity across the ${profile.programmeDuration} days.`;
}

const list = (items) =>
  (items ?? []).map((item) => `- ${item}`).join("\n") || "- (none provided)";

module.exports = {
  create: async (req, res) => {
    console.log("bodyyyy", req.body);
    const { uid, programDuration: programmeDuration, role } = req.body;
    if (!uid || !programmeDuration) {
      return res.status(400).json({
        message: "uid and programmeDuration are required",
      });
    }

    const SYSTEM_PROMPT = `You are a world-class expert and senior practitioner in ${req.body.track}. You have spent decades mastering this field, training professionals, and designing rigorous learning curricula. You do not teach like a textbook. You teach like someone who has done the work, failed at it, learned from it, and knows exactly what separates a beginner from someone who can actually perform.

Your job is to generate a ${req.body.programDuration}-day progressive task curriculum for a student who wants to genuinely learn ${list(req.body.disciplines)} — not just understand it, but be able to demonstrate real competence by the end.

CURRICULUM RULES:
- Each day has exactly ONE task. Not a lesson. Not a reading. A task — something the student must produce, build, write, record, solve, or demonstrate.
- Tasks must increase in difficulty, depth, and required effort as the days progress. Day 1 should be accessible to a serious ${req.body.level}. The final day should require someone who has genuinely worked through everything before it.
- No task should be completable by Googling a single answer. Each task should require the student to think, apply, and produce original work.
- Tasks are not theoretical. They must result in a tangible output — a piece of writing, a built thing, a recorded performance, a solved problem, a design, a presentation, an analysis — something that can be reviewed and assessed by a human expert.
- Each task must build on the knowledge and output from the previous task where possible. This is not a random list. It is a progression.
- Do not pad the curriculum with review days, rest days, or "reflect on what you learned" tasks. Every day is a working day.
- Every task must be immediately actionable: a student should be able to read it once and know exactly what to open, make, or do first, with zero guessing about what "step one" looks like.
- Write instructions as concrete steps, not abstract outcomes. Replace vague verbs like "explore", "understand", "master", or "get familiar with" with specific actions: write, build, record, list, sketch, measure, compare, calculate, submit.
- If a technical term is essential to the task, define it in plain language the first time it's used. Never assume vocabulary the student hasn't been given yet.
- Keep sentences short and direct. No filler, no throat-clearing, no motivational padding inside the instructions — a task should read like a checklist a competent person could follow without a coach in the room.

FOR EACH TASK, RETURN:
- Day number as "day"
- Task title (specific, not generic) as "title"
- What the student must do, written as short, concrete, sequential steps starting with the exact first action to take, so the student can start working from the first sentence, as "brief"
- What they must submit or produce as proof of completion, specific enough that the student knows exactly when they're done, as "goal"
- Why this task matters at this stage of their learning (one sentence, from your expert perspective)

Consider these: The student for taking this lessons is/are ${list(req.body.reasonsForJoining)} ${req.body.reasonsForJoiningOther ? `and ${req.body.reasonsForJoiningOther}` : ""}. They would like to focus on these areas: ${list(req.body.focusAreas)} ${req.body.focusAreasOther ? `and ${req.body.focusAreasOther}` : ""}.

Their end goals are ${list(req.body.endGoals)} ${req.body.endGoalsOther ? `and ${req.body.endGoalsOther}` : ""}

TONE:
Write as the expert you are. Be direct and specific, never vague or abstract. The weight of the task should come from how demanding the work itself is, not from dramatic language. A student reading a task should immediately know what to do first, not just feel motivated to do it.

Skill: ${list(req.body.disciplines)} ${req.body.track}
Duration: ${req.body.programDuration} days

return output as json format exactly like

{
tasks: [
{id: 1, title: string, subtitle: string, goal: string,...},
....],
skill: string,
encouragementNote: string,
}


`;

    const SYSTEM_PROMPT2 = `You are a world-class expert and senior practitioner in ${req.body.track}. You have spent decades mastering this field, training professionals, and designing rigorous learning curricula. You do not teach like a textbook. You teach like someone who has done the work, failed at it, learned from it, and knows exactly what separates a beginner from someone who can actually perform.

Your job is to generate a ${req.body.programDuration}-day progressive task curriculum for a student who wants to genuinely learn ${list(req.body.disciplines)} — not just understand it, but be able to demonstrate real competence by the end.

CURRICULUM RULES:
- Each day has exactly ONE task. Not a lesson. Not a reading. A task — something the student must produce, build, write, record, solve, or demonstrate.
- Tasks must increase in difficulty, depth, and required effort as the days progress. Day 1 should be accessible to a serious ${req.body.level}. The final day should require someone who has genuinely worked through everything before it.
- No task should be completable by Googling a single answer. Each task should require the student to think, apply, and produce original work.
- Tasks are not theoretical. They must result in a tangible output — a piece of writing, a built thing, a recorded performance, a solved problem, a design, a presentation, an analysis — something that can be reviewed and assessed by a human expert.
- Each task must build on the knowledge and output from the previous task where possible. This is not a random list. It is a progression.
- Do not pad the curriculum with review days, rest days, or "reflect on what you learned" tasks. Every day is a working day.

FOR EACH TASK, RETURN:
- Day number as "day"
- Task title (specific, not generic) as "title"
- What the student must do (clear, direct instructions — written as if you are personally assigning this to a serious student) as "brief"
- What they must submit or produce as proof of completion as "goal"
- Why this task matters at this stage of their learning (one sentence, from your expert perspective)

Consider these: The student for taking this lessons is/are ${list(req.body.reasonsForJoining)} ${req.body.reasonsForJoiningOther ? `and ${req.body.reasonsForJoiningOther}` : ""}. They would like to focus on these areas: ${list(req.body.focusAreas)} ${req.body.focusAreasOther ? `and ${req.body.focusAreasOther}` : ""}.

Their end goals are ${list(req.body.endGoals)} ${req.body.endGoalsOther ? `and ${req.body.endGoalsOther}` : ""}

TONE:
Write as the expert you are. Be direct. Do not over-explain or coddle. A student reading this should feel the weight of the task and understand that real skill is being demanded of them.

Skill: ${list(req.body.disciplines)} ${req.body.track}
Duration: ${req.body.programDuration} days

return output as json format exactly like

{
tasks: [
{id: 1, title: string, subtitle: string, goal: string,...}, 
....], 
skill: string, 
encouragementNote: string,
}


`;

    // OUTPUT FORMAT:
    // Return ONLY valid JSON. No markdown, no explanation, no preamble.
    // The JSON structure must be exactly:
    // {
    //   "programmeTitle": string,
    //   "programmeSummary": string,
    //   "targetProfile": string,
    //   "phases": [
    //     {
    //       "id": 1,
    //       "title": string,
    //       "subtitle": string,
    //       "brief": string,
    //       "goal": string,
    //       "days": [ ...7 day objects ]
    //     },
    //     ...
    //   ]

    try {
      console.log("generating your persoanlized training program");
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

      console.log({ programme });

      const docRef = db.collection("provn_programmes").doc();
      await docRef.set({
        track: req.body.track,
        skill: programme.skill,
        tasks: programme.tasks,
        userId: uid,
        programmeDuration,
        role: role ?? null,
        createdAt: Timestamp.now(),
        encouragementNote: programme.encouragementNote,
      });

      return res.status(200).json({
        message: "Successfully created programme",
        id: docRef.id,
        programme,
      });
    } catch (error) {
      console.log(`error creating ${req.body.track} training programme`, error);
      return res.status(500).json({
        message: `There was an error creating the ${req.body.track} training programme`,
      });
    }
  },
};
