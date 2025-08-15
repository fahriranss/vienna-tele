const fs = require("fs");
const settings = require('../settings');
const { GoogleGenAI } = require("@google/genai");

const aiGemini = new GoogleGenAI({ apiKey: settings.apigemini });
const geminiDbFile = "./gemini_db.json";
const autoGeminiDB = JSON.parse(fs.readFileSync(geminiDbFile, "utf-8"));

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let handler = async (m, { vienna, text, command }) => {
    const userId = m.sender;

    if (!text) return m.reply(`Contoh: ${command} halo apa kabar?`);
    if (!autoGeminiDB.status) return m.reply("⚠️ Fitur AI sedang dimatikan oleh owner.");

    autoGeminiDB.sessions[userId] = autoGeminiDB.sessions[userId] || [];
    autoGeminiDB.sessions[userId].push({ role: "user", content: text });

    const systemPrompt = settings.prompt;
    const history = autoGeminiDB.sessions[userId]
        .map(i => `${i.role}: ${i.content}`)
        .join("\n");
    const contents = systemPrompt + "\n" + history;

    try {
        await vienna.sendChatAction(m.chat, "typing");
        await sleep(1500);

        const reply = await aiGemini.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: contents }] }]
        });

        const aiReply = reply.text || "Maaf, aku nggak bisa jawab itu 😥";
        autoGeminiDB.sessions[userId].push({ role: "assistant", content: aiReply });
        fs.writeFileSync(geminiDbFile, JSON.stringify(autoGeminiDB, null, 2));

        await vienna.sendMessage(m.chat, aiReply, { reply_to_message_id: m.id });
    } catch (err) {
        console.error(err);
        m.reply("⚠️ Error saat menjawab.");
    }
};

handler.command = ["ai", "chat", "ask"];
handler.tags = ["ai"];
handler.help = ["ai", "chat", "ask"].map(a => `${a} *pertanyaan*`);

module.exports = handler;
