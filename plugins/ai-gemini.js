const fs = require('fs');
const axios = require('axios');
const { createUserContent, createPartFromUri } = require('@google/genai');
const settings = require('../settings');
const { GoogleGenAI } = require('@google/genai');
const aiGemini = new GoogleGenAI({ apiKey: settings.apigemini });
const geminiDbFile = "./gemini_db.json";
const prefix = '[\\/\\.~\\$\\>]';

if (!fs.existsSync(geminiDbFile)) {
  fs.writeFileSync(geminiDbFile, JSON.stringify({ status: true, sessions: {} }, null, 2), "utf-8");
}
const autoGeminiDB = JSON.parse(fs.readFileSync(geminiDbFile, "utf-8"));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = function(bot) {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const prefixRegexStart = new RegExp('^' + prefix);

    if (msg.chat.type !== "private" || !autoGeminiDB.status || userId === bot.id || (msg.text && prefixRegexStart.test(msg.text))) return;

    autoGeminiDB.sessions[userId] = autoGeminiDB.sessions[userId] || [];

    // ====== GAMBAR (foto)
    if (msg.photo) {
      const promptText = msg.caption || "Deskripsikan gambar ini";
      const fullPrompt = settings.prompt + promptText;

      autoGeminiDB.sessions[userId].push({ role: "user", content: `[IMAGE] ${promptText}` });

      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const filePath = await bot.downloadFile(fileId, "./downloads");

      if (!filePath) return bot.sendMessage(chatId, "❌ Gagal mengunduh foto.");

      await bot.sendChatAction(chatId, "typing");
      await sleep(500);
      bot.sendMessage(chatId, "⏳ Mengunggah dan memproses gambar...");

      try {
        const imageResponse = await aiGemini.files.upload({ file: filePath });
        const contents = [createUserContent([
          fullPrompt,
          createPartFromUri(imageResponse.uri, imageResponse.mimeType)
        ])];

        const response = await aiGemini.models.generateContent({ model: "gemini-2.0-flash", contents });
        const aiReply = response.text || "Tidak ada respons.";

        autoGeminiDB.sessions[userId].push({ role: "assistant", content: aiReply });
        fs.writeFileSync(geminiDbFile, JSON.stringify(autoGeminiDB, null, 2));
        bot.sendMessage(chatId, aiReply);
      } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, "⚠️ Terjadi kesalahan saat memproses gambar.");
      }
      return;
    }

    // ====== TEKS SAJA
    if (!msg.text) return;

    let isImageRequest = false;
    try {
      const classifyPrompt = `Apakah kalimat berikut meminta dibuatkan atau digenerate sebuah gambar (jawab hanya "yes" atau "no")?\n"${msg.text}"`;

      const cls = await aiGemini.models.generateContent({
        model: "gemini-2.0-flash",
        contents: classifyPrompt,
      });

      if (cls.text.trim().toLowerCase().startsWith("yes")) isImageRequest = true;
    } catch (e) {}

    // ====== PERMINTAAN GAMBAR (text)
    if (isImageRequest) {
      let [promptText, styleText] = msg.text.split("|").map(s => s.trim());
      if (!promptText) promptText = msg.text.trim();
      const style = (styleText || "realistic").toLowerCase();

      await bot.sendChatAction(chatId, "upload_photo");
      bot.sendMessage(chatId, "⏳ Membuat gambar, mohon tunggu…");

      try {
        const deviceId = `dev-${Math.floor(Math.random() * 1e6)}`;
        const resp = await axios.post('https://api-preview.chatgot.io/api/v1/deepimg/flux-1-dev', {
          prompt: `${promptText} -style ${style}`,
          size: "1024x1024",
          device_id: deviceId
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://deepimg.ai',
            'Referer': 'https://deepimg.ai/'
          }
        });

        const images = resp.data?.data?.images;
        if (images && images.length) {
          const url = images[0].url;
          await bot.sendPhoto(chatId, url, {
            caption: `✅ Gambar berhasil dibuat!\n\n*Prompt:* ${promptText}\n*Style:* ${style}`,
            parse_mode: "Markdown"
          });

          autoGeminiDB.sessions[userId].push({ role: "assistant", content: `[IMAGE] ${promptText} | ${style}` });
          fs.writeFileSync(geminiDbFile, JSON.stringify(autoGeminiDB, null, 2));
        } else {
          bot.sendMessage(chatId, "❌ Gagal mendapatkan gambar.");
        }
      } catch (err) {
        bot.sendMessage(chatId, "⚠️ Terjadi kesalahan saat membuat gambar.");
      }
      return;
    }

    // ====== CHAT AI BIASA
    autoGeminiDB.sessions[userId].push({ role: "user", content: msg.text });
    const history = autoGeminiDB.sessions[userId].map(i => `${i.role}: ${i.content}`).join("\n");
    const contents = settings.prompt + "\n" + history;

    try {
      await bot.sendChatAction(chatId, "typing");
      await sleep(2000);

      const reply = await aiGemini.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: contents }] }]
      });

      const aiReply = reply.text || "Tidak ada respons.";
      autoGeminiDB.sessions[userId].push({ role: "assistant", content: aiReply });
      fs.writeFileSync(geminiDbFile, JSON.stringify(autoGeminiDB, null, 2));

      await bot.sendMessage(chatId, aiReply);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, "⚠️ Terjadi kesalahan saat menghubungi AI.");
    }
  });
}
