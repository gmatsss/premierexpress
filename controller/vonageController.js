const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const BASE_URL =
  "https://premierexpress-csawb3cwgkgnchfy.canadacentral-01.azurewebsites.net";
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

  // Store user's message
  sessions[convoId]?.history.push({ role: "user", content: userText });

  // Send to OpenAI
  const aiReply = await getAiReply(sessions[convoId].history);

  // Store assistant response
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

exports.handleEvent = (req, res) => {
  const event = req.body;
  console.log("📞 Vonage Event:", event);

  if (event.status === "rejected" || event.status === "unanswered") {
    console.log("🚨 Call not completed. Consider sending voicemail.");
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
