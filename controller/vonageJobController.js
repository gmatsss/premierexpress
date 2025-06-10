const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const BASE_URL =
  "https://premierexpress-csawb3cwgkgnchfy.canadacentral-01.azurewebsites.net";
const N8N_WEBHOOK_URL =
  "https://premierfitness.app.n8n.cloud/webhook/93baecc5-854c-4515-8899-8d48728dfb33";

const jobsSessions = {};

exports.handleJobsAnswer = (req, res) => {
  const convoId = uuidv4();
  jobsSessions[convoId] = { history: [] };

  return res.json([
    {
      action: "talk",
      text: "Hi! This is Premier Fitness assistant following up on your service job. How can I help you today?",
    },
    {
      action: "input",
      type: ["speech"],
      eventUrl: [`${BASE_URL}/jobs/speech?cid=${convoId}`],
    },
  ]);
};

exports.handleJobsSpeech = async (req, res) => {
  const { speech, uuid } = req.body;
  const convoId = req.query.cid;
  const userText = speech?.results?.[0]?.text || "I didn't catch that.";

  jobsSessions[convoId]?.history.push({ role: "user", content: userText });

  const aiReply = await getJobsAiReply(jobsSessions[convoId].history);

  jobsSessions[convoId].history.push({ role: "assistant", content: aiReply });

  return res.json([
    {
      action: "talk",
      text: aiReply,
    },
    {
      action: "input",
      type: ["speech"],
      eventUrl: [`${BASE_URL}/jobs/speech?cid=${convoId}`],
    },
  ]);
};

exports.handleJobsEvent = async (req, res) => {
  const event = req.body;
  const query = req.query;

  console.log("📞 Vonage Job Event:", event);
  console.log("📎 Query Params:", query);

  const payload = {
    ...event,
    metadata: query,
  };

  try {
    await axios.post(N8N_WEBHOOK_URL, payload);
    console.log("✅ Job event sent to n8n.");
  } catch (err) {
    console.error("❌ Failed to send job event to n8n:", err.message);
  }

  res.status(200).end();
};

async function getJobsAiReply(history) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: history,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("GPT error (Jobs):", error.message);
    return "Sorry, I had trouble understanding that.";
  }
}
