const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const BASE_URL =
  "https://premierexpress-csawb3cwgkgnchfy.canadacentral-01.azurewebsites.net";
const N8N_WEBHOOK_URL =
  "https://premierfitness.app.n8n.cloud/webhook/b9c1427a-f6ea-44df-9046-878c07cc7338";

const sessions = {}; // Temporary in-memory storage

exports.handleAnswer = (req, res) => {
  const convoId = uuidv4();
  sessions[convoId] = { history: [] };

  return res.json([
    {
      action: "talk",
      text: "Hi! This is Premier Fitness assistant. How can I help you today?",
    },
    {
      action: "input",
      type: ["speech"],
      eventUrl: [`${BASE_URL}/sf/speech?cid=${convoId}`],
    },
  ]);
};

exports.handleSpeech = async (req, res) => {
  const { speech, uuid } = req.body;
  const convoId = req.query.cid;
  const userText = speech?.results?.[0]?.text || "I didn't catch that.";

  sessions[convoId]?.history.push({ role: "user", content: userText });

  const aiReply = await getAiReply(sessions[convoId].history);

  sessions[convoId].history.push({ role: "assistant", content: aiReply });

  return res.json([
    {
      action: "talk",
      text: aiReply,
    },
    {
      action: "input",
      type: ["speech"],
      eventUrl: [`${BASE_URL}/sf/speech?cid=${convoId}`],
    },
  ]);
};

exports.handleEvent = async (req, res) => {
  const event = req.body;
  const query = req.query; // ⬅️ This grabs invoice=..., days=..., etc.

  console.log("📞 Vonage Event:", event);
  console.log("📎 Query Params:", query);

  const payload = {
    ...event,
    metadata: query, // 👈 Forward the invoice metadata
  };

  try {
    await axios.post(N8N_WEBHOOK_URL, payload);
    console.log("✅ Event sent to n8n.");
  } catch (err) {
    console.error("❌ Failed to send to n8n:", err.message);
  }

  res.status(200).end();
};

async function getAiReply(history) {
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
    console.error("GPT error:", error.message);
    return "Sorry, I had trouble understanding that.";
  }
}
